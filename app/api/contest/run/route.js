
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Problem from '@/models/Problem'; // Ensure registered
import { getSession } from '@/lib/auth';
import { executeCode } from '@/lib/piston';

export async function POST(req) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { problemSlug, code, language } = body;

        if (!problemSlug || !code || !language) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        await dbConnect();

        // 1. Fetch Problem & Test Cases
        const problem = await Problem.findOne({ slug: problemSlug });
        if (!problem) {
            return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
        }

        // 2. Filter for Public Test Cases (Run Mode)
        let casesToRun = problem.testCases.filter(tc => tc.isPublic);

        // Fallback: If no public cases marked, use the first one so the user can at least run something
        if (casesToRun.length === 0 && problem.testCases.length > 0) {
            casesToRun = [problem.testCases[0]];
        }

        if (casesToRun.length === 0) {
            return NextResponse.json({ error: 'No test cases available to run' }, { status: 400 });
        }

        // 3. The Execution Loop (No DB persistence)
        let detailResults = [];
        let finalStatus = 'Accepted'; // Optimistic default for the run session

        for (const [index, testCase] of casesToRun.entries()) {
            try {
                // Execute code against this test case
                const result = await executeCode(language, code, testCase.input);
                const runData = result;

                // Check for Runtime/Compilation Error
                if (runData.code !== 0) {
                    return NextResponse.json({
                        success: true,
                        status: 'Runtime Error',
                        message: runData.stderr || runData.stdout,
                        results: []
                    });
                }

                const actualOutput = (runData.stdout || "").trim().replace(/\r\n/g, '\n');
                const expectedOutput = (testCase.output || "").trim().replace(/\r\n/g, '\n');
                const isPassed = actualOutput === expectedOutput;

                if (!isPassed) {
                    finalStatus = 'Wrong Answer';
                }

                // Add to detailed results
                detailResults.push({
                    id: index,
                    status: isPassed ? 'Passed' : 'Failed',
                    input: testCase.input,
                    expectedOutput: testCase.output,
                    actualOutput: runData.stdout || ""
                });

            } catch (execError) {
                console.error("Execution Error:", execError);
                return NextResponse.json({
                    success: true,
                    status: 'System Error',
                    message: 'Execution failed internal error'
                });
            }
        }

        return NextResponse.json({
            success: true,
            status: finalStatus,
            passed: detailResults.filter(r => r.status === 'Passed').length,
            total: casesToRun.length,
            results: detailResults
        });

    } catch (error) {
        console.error('Run Code Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
