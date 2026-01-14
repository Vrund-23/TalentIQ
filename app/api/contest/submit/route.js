
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Submission from '@/models/Submission';
import Problem from '@/models/Problem';
import { getSession } from '@/lib/auth';
import { executeCode } from '@/lib/piston';

export async function POST(req) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { contestId, problemSlug, code, language } = body;

        if (!problemSlug || !code || !language) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        await dbConnect();

        // 1. Fetch Problem & Test Cases
        const problem = await Problem.findOne({ slug: problemSlug });
        if (!problem) {
            return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
        }

        if (!problem.testCases || problem.testCases.length === 0) {
            return NextResponse.json({ error: 'No test cases to judge against' }, { status: 400 });
        }

        // 2. Create Submission (Status: Pending)
        const submission = await Submission.create({
            userId: session.user.id,
            problemSlug,
            code,
            language,
            status: 'Pending',
            contestId: contestId || null
        });

        // 3. The Judging Loop
        let passedCases = 0;
        let finalStatus = 'Accepted';
        let detailResults = [];

        for (const [index, testCase] of problem.testCases.entries()) {
            try {
                // Execute code against this test case
                const result = await executeCode(language, code, testCase.input);

                // My piston wrapper returns the 'run' object directly now, so result is the run object.
                // But let's be safe: Piston response { run: { ... } } or wrapper might return run. 
                // Based on previous step, executeCode returns `data.run`.

                const runData = result;

                // Check for Runtime/Compilation Error
                if (runData.code !== 0) {
                    finalStatus = 'Runtime Error';
                    // We stop detailed testing on the first crash to save resources and return the error
                    return NextResponse.json({
                        success: true,
                        status: 'Runtime Error',
                        message: runData.stderr || runData.stdout, // Sometimes error is in stdout for some langs
                        passed: passedCases,
                        total: problem.testCases.length,
                        results: []
                    });
                }

                const actualOutput = (runData.stdout || "").trim().replace(/\r\n/g, '\n');
                const expectedOutput = (testCase.output || "").trim().replace(/\r\n/g, '\n');
                const isPassed = actualOutput === expectedOutput;

                if (isPassed) {
                    passedCases++;
                } else {
                    if (finalStatus === 'Accepted') finalStatus = 'Wrong Answer';
                }

                // Add to detailed results
                detailResults.push({
                    id: index,
                    status: isPassed ? 'Passed' : 'Failed',
                    input: testCase.input,
                    expectedOutput: testCase.output, // Send raw for display
                    actualOutput: runData.stdout || "" // Send raw output (not trimmed) to show user exactly what happened
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

        // 4. Update DB
        submission.status = finalStatus;
        await submission.save();

        return NextResponse.json({
            success: true,
            status: finalStatus,
            passed: passedCases,
            total: problem.testCases.length,
            results: detailResults
        });

    } catch (error) {
        console.error('Submission Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
