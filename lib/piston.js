
export async function executeCode(language, sourceCode, stdin) {
    // Map internal language IDs/Names to Piston expectations
    const languageConfig = {
        'python': { language: 'python', version: '3.10.0' },
        'javascript': { language: 'javascript', version: '18.15.0' },
        'cpp': { language: 'cpp', version: '10.2.0' },
        'java': { language: 'java', version: '15.0.2' },
    };

    const config = languageConfig[language];
    if (!config) {
        throw new Error(`Unsupported language: ${language}`);
    }

    const payload = {
        language: config.language,
        version: config.version,
        files: [
            {
                content: sourceCode
            }
        ],
        stdin: stdin || "",
        args: [],
        compile_timeout: 10000,
        run_timeout: 3000,
        compile_memory_limit: -1,
        run_memory_limit: -1
    };

    try {
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Piston API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.run; // Returns object { stdout, stderr, code, signal, output }
    } catch (error) {
        console.error("Piston Execution Failed:", error);
        throw error;
    }
}
