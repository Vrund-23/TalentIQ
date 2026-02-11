import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";



export async function POST(req) {
    try {
        const { prompt } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        if (!process.env.GEMINI_API_KEY) {
            throw new Error("GEMINI_API_KEY is not defined");
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log("Using Gemini model: gemini-flash-latest");
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const instruction = `
            Generate a competitive programming problem based on this title/topic: "${prompt}".
            Provide the following in JSON format:
            {
                "title": "Problem Title",
                "description": "Clear and detailed problem statement",
                "difficulty": "Easy/Medium/Hard",
                "constraints": "Constraints for the problem",
                "inputFormat": "Format of input",
                "outputFormat": "Format of output",
                "tags": ["tag1", "tag2"],
                "testCases": [
                    { "input": "input1", "output": "output1", "isPublic": true },
                    { "input": "input2", "output": "output2", "isPublic": true },
                    { "input": "hidden1", "output": "hidden_output1", "isPublic": false },
                    { "input": "hidden2", "output": "hidden_output2", "isPublic": false },
                    { "input": "hidden3", "output": "hidden_output3", "isPublic": false }
                ],
                "starterCode": {
                    "cpp": "// Generated C++ starter code with main function and Solution class",
                    "java": "// Generated Java starter code with main class and Solution class",
                    "python": "# Generated Python starter code with Solution class and driver code",
                    "javascript": "// Generated JavaScript starter code with Solution class and driver code"
                }
            }
            Ensure there are exactly 2 public and 3 hidden test cases as requested.
            
            For "starterCode":
            1. Provide a Class-based structure (e.g., class Solution).
            2. Define the correct method signature based on the problem (e.g., int solve(int n)).
            3. CRITICAL: DO NOT IMPLEMENT THE SOLUTION LOGIC. The method body MUST be empty or return a default/dummy value (e.g. return 0; or return "";).
            4. Include a main method/driver code that reads Input according to inputFormat, calls the Solution method, and prints the Output.
            
            Return ONLY the JSON. No markdown, no extra text.
        `;

        const result = await model.generateContent(instruction);
        const response = await result.response;
        let text = response.text();

        // Clean up the response if it's wrapped in triple backticks
        text = text.replace(/```json/g, "").replace(/```/g, "").trim();

        try {
            const problemData = JSON.parse(text);
            return NextResponse.json({ success: true, problem: problemData });
        } catch (parseError) {
            console.error("JSON parse error:", parseError, "Response was:", text);
            // Fallback attempt to extract JSON
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const problemData = JSON.parse(jsonMatch[0]);
                return NextResponse.json({ success: true, problem: problemData });
            }
            throw new Error("Failed to parse AI response as JSON");
        }
    } catch (error) {
        console.error("Gemini API error:", error);
        return NextResponse.json({ error: "Failed to generate problem: " + error.message }, { status: 500 });
    }
}
