const puppeteer = require('puppeteer');
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function scrapeCodeChef(url) {
    let browser = null;
    try {
        const launchOptions = {
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
            ]
        };

        browser = await puppeteer.launch(launchOptions);

        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1080 });

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        try {
            await page.waitForSelector('#problem-statement', { timeout: 45000 });
        } catch (e) {
            console.warn("Wait for #problem-statement timed out, trying to proceed with available content");
        }

        // Extract data directly from the DOM using page.evaluate
        const extractedData = await page.evaluate(() => {
            const cleanText = (text) => text?.replace(/\s+/g, ' ').trim() || '';

            const statementContainer = document.querySelector('#problem-statement');
            if (!statementContainer) return null;

            const removeElements = (selector) => statementContainer.querySelectorAll(selector).forEach(el => el.remove());
            removeElements('.MathJax');
            removeElements('.MathJax_Preview');
            removeElements('.katex-mathml');
            removeElements('script');
            removeElements('style');

            let title = cleanText(document.querySelector('h1')?.innerText);
            if (!title) {
                const titleEl = document.querySelector('span[class^="ProblemTitle_title__"]');
                if (titleEl) title = cleanText(titleEl.innerText);
            }

            const testCases = [];
            const preTags = Array.from(statementContainer.querySelectorAll('pre'));

            if (preTags.length > 0 && preTags.length % 2 === 0) {
                for (let i = 0; i < preTags.length; i += 2) {
                    testCases.push({
                        input: preTags[i].innerText.replace(/Input:?/i, '').trim(),
                        output: preTags[i + 1].innerText.replace(/Output:?/i, '').trim(),
                        isPublic: true
                    });
                }
            }
            else if (preTags.length > 0) {
                preTags.forEach(pre => {
                    const text = pre.innerText;
                    if (text.toLowerCase().includes('input') && text.toLowerCase().includes('output')) {
                        const parts = text.split(/Output:?/i);
                        if (parts.length > 1) {
                            testCases.push({
                                input: parts[0].replace(/Input:?/i, '').trim(),
                                output: parts[1].trim(),
                                isPublic: true
                            });
                        }
                    }
                });
            }

            let description = "";
            let constraints = "";
            let inputFormat = "";
            let outputFormat = "";

            const sections = {
                desc: [],
                input: [],
                output: [],
                constraints: []
            };

            let currentSection = 'desc';
            const children = Array.from(statementContainer.children);

            for (const child of children) {
                const text = child.innerText.trim();
                const lowerText = text.toLowerCase();

                if (['H2', 'H3', 'H4'].includes(child.tagName) || (child.tagName === 'P' && child.querySelector('strong') && text.length < 50)) {
                    if (lowerText.includes('input format') || lowerText.includes('input')) currentSection = 'input';
                    else if (lowerText.includes('output format') || lowerText.includes('output')) currentSection = 'output';
                    else if (lowerText.includes('constraints')) currentSection = 'constraints';
                    else if (lowerText.includes('sample') || lowerText.includes('example')) currentSection = 'ignore';
                    continue;
                }

                if (currentSection === 'ignore') continue;
                if (!text) continue;

                if (currentSection === 'desc') sections.desc.push(text);
                else if (currentSection === 'input') sections.input.push(text);
                else if (currentSection === 'output') sections.output.push(text);
                else if (currentSection === 'constraints') sections.constraints.push(text);
            }

            description = sections.desc.join('\n\n');
            inputFormat = sections.input.join('\n\n');
            outputFormat = sections.output.join('\n\n');
            constraints = sections.constraints.join('\n\n');

            const rawText = statementContainer.innerText;

            return {
                title,
                description,
                constraints,
                inputFormat,
                outputFormat,
                testCases,
                rawText
            };
        });

        if (!extractedData) {
            throw new Error("Failed to extract data from problem statement. The layout might be different.");
        }

        return {
            ...extractedData,
            originalUrl: url,
            platform: 'CodeChef'
        };

    } catch (error) {
        console.error("CodeChef Scrape Error:", error);
        throw error;
    } finally {
        if (browser) await browser.close();
    }
}

exports.cleanScrape = async (req, res) => {
    try {
        const { url, platform, useAI } = req.body;

        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        let data = {};
        if (platform === 'codechef' || url.includes('codechef.com')) {
            data = await scrapeCodeChef(url);

            if (useAI || !data.testCases || data.testCases.length === 0 || !data.title) {
                try {
                    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use specific model name that works

                    async function generateWithRetry(payload, retries = 3) {
                        for (let i = 0; i < retries; i++) {
                            try {
                                return await model.generateContent(payload);
                            } catch (error) {
                                const isOverloaded = error.message.includes('503') || error.message.includes('Overloaded');
                                if (isOverloaded && i < retries - 1) {
                                    await new Promise(r => setTimeout(r, 2000 * (i + 1)));
                                    continue;
                                }
                                throw error;
                            }
                        }
                    }

                    const scrapedCount = data.testCases ? data.testCases.length : 0;
                    const publicNeeded = Math.max(0, 2 - scrapedCount);

                    const prompt = `
                    You are an expert competitive programming assistant.
                    I have scraped a problem from CodeChef.
                    
                    Here is the scraped raw text content:
                    """
                    ${data.rawText}
                    """

                    Current Scraped Test Cases: ${scrapedCount}
                    
                    I strictly require a TOTAL of 5 Test Cases:
                    - 2 PUBLIC Test Cases (I have ${scrapedCount}, so generate ${publicNeeded} more simple cases).
                    - 3 PRIVATE Test Cases (Extreme Hard / Hidden).

                    Please analyze the text and extract/generate the following in valid JSON format:
                    {
                        "title": "Extract exact title",
                        "description": "Clean, readable problem statement summary (fix math symbols, remove duplicates)",
                        "constraints": "Extract constraints",
                        "inputFormat": "Extract input format. CRITICAL: Remove all LaTeX formatting (e.g., change $T$ to T, $10^5$ to 10^5). Make it clean and readable plain text.",
                        "outputFormat": "Extract output format. CRITICAL: Remove all LaTeX formatting. Use clean plain text.",
                        "tags": ["Tag1", "Tag2"],
                        "difficulty": "Easy/Medium/Hard",
                        "generatedPublicCases": [
                            { "input": "...", "output": "...", "isPublic": true }
                        ],
                        "hiddenTestCases": [
                            { "input": "...", "output": "...", "isPublic": false },
                            { "input": "...", "output": "...", "isPublic": false },
                            { "input": "...", "output": "...", "isPublic": false }
                        ],
                        "starterCode": {
                            "cpp": "// Generated C++ starter...",
                            "java": "// Generated Java starter...",
                            "python": "# Generated Python starter...",
                            "javascript": "// Generated JS starter..."
                        }
                    }

                    For "starterCode":
                    1. Class-based structure (class Solution).
                    2. Empty method body (DO NOT SOLVE).
                    3. Include driver code (main function) to handle input/output.

                    Return ONLY the JSON.
                    `;

                    const result = await generateWithRetry(prompt);
                    const response = await result.response;
                    const text = response.text();

                    const jsonMatch = text.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const aiData = JSON.parse(jsonMatch[0]);

                        if (!data.title && aiData.title) data.title = aiData.title;
                        if (aiData.description) data.description = aiData.description;

                        if (!data.testCases) data.testCases = [];

                        const keptScraped = data.testCases.slice(0, 2);
                        keptScraped.forEach(tc => tc.isPublic = true);

                        const finalTestCases = [...keptScraped];

                        if (aiData.generatedPublicCases && Array.isArray(aiData.generatedPublicCases)) {
                            aiData.generatedPublicCases.forEach(tc => {
                                if (finalTestCases.length < 2) {
                                    finalTestCases.push({ ...tc, isPublic: true });
                                }
                            });
                        }

                        if (aiData.hiddenTestCases && Array.isArray(aiData.hiddenTestCases)) {
                            const hidden = aiData.hiddenTestCases.slice(0, 3).map(tc => ({ ...tc, isPublic: false }));
                            finalTestCases.push(...hidden);
                        }

                        data.testCases = finalTestCases;

                        if (!data.constraints && aiData.constraints) data.constraints = aiData.constraints;
                        if (!data.inputFormat && aiData.inputFormat) data.inputFormat = aiData.inputFormat;
                        if (!data.outputFormat && aiData.outputFormat) data.outputFormat = aiData.outputFormat;
                        if (aiData.tags) data.tags = aiData.tags;
                        if (aiData.difficulty) data.difficulty = aiData.difficulty;
                        if (aiData.starterCode) data.starterCode = aiData.starterCode;
                    }
                } catch (aiError) {
                    console.warn("AI Enhancement failed:", aiError);
                }
            }
        } else {
            return res.status(400).json({ error: "Platform not supported for scraping" });
        }

        delete data.rawText;
        return res.json({ success: true, problem: data });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
