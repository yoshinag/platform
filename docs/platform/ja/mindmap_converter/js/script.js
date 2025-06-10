document.addEventListener('DOMContentLoaded', () => {
    const mindmapInput = document.getElementById('mindmapInput');
    const outputPatternSelect = document.getElementById('outputPattern');
    const convertButton = document.getElementById('convertButton');
    const jsonOutputElement = document.getElementById('jsonOutput');

    function convertPattern1ToPattern2(pattern1NodeChildren) {
        // (この関数は前回のままでOK)
        const pattern2Object = {};
        if (!pattern1NodeChildren || !Array.isArray(pattern1NodeChildren)) {
            return pattern2Object;
        }
        for (const childNode of pattern1NodeChildren) {
            const nodeNameKey = childNode.name;
            if (childNode.children && childNode.children.length > 0) {
                pattern2Object[nodeNameKey] = convertPattern1ToPattern2(childNode.children);
            } else {
                pattern2Object[nodeNameKey] = {};
            }
        }
        return pattern2Object;
    }

    // Mermaid.js風のインデント解釈を試みる (パターン1 JSONを生成)
    function mindMapTextToJson(text) {
        console.log(`[mindMapTextToJson - MermaidStyle] Called.`);
        const originalLines = text.trim().split('\n');
        let linesForProcessing = [];
        for (const line of originalLines) {
            const trimmedLine = line.trim();
            if (trimmedLine === '' || trimmedLine.startsWith('%%')) continue;
            linesForProcessing.push(line);
        }
        console.log(`[MermaidStyle] Lines for processing:`, linesForProcessing.map(l => `"${l}"`));

        if (linesForProcessing.length === 0) return { error: "Input empty." };

        if (linesForProcessing[0].trim().toLowerCase() === 'mindmap') {
            linesForProcessing.shift();
        }
        if (linesForProcessing.length === 0) return { error: "No data after 'mindmap'." };

        const rootLineRaw = linesForProcessing.shift();
        if (!rootLineRaw) return { error: "Root line missing."};
        const rootLine = rootLineRaw.trim();
        const rootMatch = rootLine.match(/^root\(\((.*)\)\)$/);
        if (!rootMatch) return { error: `Invalid root: "${rootLine}"` };

        const rawRootName = rootMatch[1]; // <br/> 保持
        console.log(`[MermaidStyle] Root name: "${rawRootName}"`);

        const rootJsonNode = { name: rawRootName, children: [] };
        const actualDataLines = linesForProcessing;

        if (actualDataLines.length === 0) {
            console.log("[MermaidStyle] No data lines after root.");
            return rootJsonNode;
        }

        // parentStack[level] には、そのレベルの親ノードが入る。
        // level 0 は rootJsonNode。
        const parentStack = [rootJsonNode];
        let lastIndent = -1; // 最後に処理した行のインデント（ルート行はインデント0とみなす）
        let indentUnit = 0;  // 推定されるインデント単位 (2 or 4)

        // インデント単位を推定する (最初の数行から)
        let firstDataLineIndent = -1;
        for (let i = 0; i < actualDataLines.length && i < 3; i++) { // 最初の3行程度を見る
            const currentLineIndent = actualDataLines[i].search(/\S|$/);
            if (currentLineIndent < 0) continue; // 空行だった場合など(フィルタ済みのはずだが念のため)

            if (firstDataLineIndent === -1) {
                firstDataLineIndent = currentLineIndent;
                console.log(`[MermaidStyle] First data line indent: ${firstDataLineIndent}`);
            } else if (currentLineIndent > firstDataLineIndent && indentUnit === 0) {
                indentUnit = currentLineIndent - firstDataLineIndent;
                console.log(`[MermaidStyle] Deduced indentUnit: ${indentUnit} from diff (${currentLineIndent} - ${firstDataLineIndent})`);
                break;
            } else if (currentLineIndent < firstDataLineIndent && indentUnit === 0) {
                // 最初の行よりインデントが浅い行がすぐ来た場合、最初の行が基準インデント
                // この場合、indentUnit は最初の行のインデント自体になるかもしれない
                indentUnit = firstDataLineIndent;
                console.log(`[MermaidStyle] Deduced indentUnit: ${indentUnit} from firstDataLineIndent itself (next line was shallower)`);
                break;
            }
        }

        if (indentUnit === 0 && firstDataLineIndent > 0) { // 差分が見つからず、最初の行にインデントがある場合
            indentUnit = firstDataLineIndent; // 最初のインデント自体を単位とする
            console.log(`[MermaidStyle] No indent diff found, using firstDataLineIndent as indentUnit: ${indentUnit}`);
        }
        if (indentUnit <= 0) { // それでも決まらない場合はデフォルト
            indentUnit = 2; // Default indent unit
            console.log(`[MermaidStyle] Could not deduce indentUnit, defaulting to: ${indentUnit}`);
        }
        // Mermaid は 2 か 4 を好むので、それに丸めることも検討できる
        if (indentUnit > 0 && indentUnit !== 2 && indentUnit !== 4) {
            if (Math.abs(indentUnit - 2) < Math.abs(indentUnit - 4)) {
                console.log(`[MermaidStyle] Snapping deduced indentUnit ${indentUnit} to 2`);
                indentUnit = 2;
            } else if (Math.abs(indentUnit - 4) < Math.abs(indentUnit - 2)) {
                console.log(`[MermaidStyle] Snapping deduced indentUnit ${indentUnit} to 4`);
                indentUnit = 4;
            } else if (indentUnit < 3) { // 1や3の場合など
                console.log(`[MermaidStyle] Snapping deduced indentUnit ${indentUnit} to 2 (default snap)`);
                indentUnit = 2;
            } else {
                console.log(`[MermaidStyle] Snapping deduced indentUnit ${indentUnit} to 4 (default snap)`);
                indentUnit = 4;
            }
        }
        console.log(`[MermaidStyle] Final indentUnit: ${indentUnit}`);


        // 最初のデータ行のインデントを基準レベル0のインデントとする
        // ただし、その最初のデータ行がインデント0の場合、それはレベル0とはみなせない。
        // レベル0の親は rootJsonNode (parentStack[0])
        // 最初のデータ行はレベル1になるはず。そのインデントを `level1Indent` とする。
        let level1Indent = -1;
        if (actualDataLines.length > 0) {
            level1Indent = actualDataLines[0].search(/\S|$/);
            if (level1Indent < 0) level1Indent = 0; //ありえないはずだが
            console.log(`[MermaidStyle] Level 1 nodes are expected around indent: ${level1Indent}`);
        }


        for (const line of actualDataLines) {
            const currentIndent = line.search(/\S|$/);
            const nodeTextWithBr = line.trim(); // <br/> 保持
            if (nodeTextWithBr === "") continue;

            // 現在のインデントからレベルを決定する
            // level1Indent の行をレベル1とする
            // (currentIndent - level1Indent) がインデントの差
            // それを indentUnit で割ったものが、level1 からの相対的なレベル差
            let calculatedLevel;
            if (level1Indent === -1) { // データ行がなかった場合 (ここには来ないはず)
                calculatedLevel = 1;
            } else {
                const indentDifference = currentIndent - level1Indent;
                // Math.max(0, ...) でマイナスにならないように
                // Math.round or Math.floor
                calculatedLevel = Math.max(0, Math.round(indentDifference / indentUnit)) + 1;
            }

            console.log(`P1-Mermaid Line: "${nodeTextWithBr}", CI: ${currentIndent}, L1Ind: ${level1Indent}, IndDiff: ${currentIndent-level1Indent}, IU: ${indentUnit}, CalcLvl: ${calculatedLevel}`);

            if (calculatedLevel <= 0) {
                console.warn(`[MermaidStyle] Calculated level ${calculatedLevel} is invalid for "${nodeTextWithBr}". Skipping.`);
                continue;
            }

            // parentStack の長さを調整。親は calculatedLevel - 1 のインデックスにいる。
            // スタックの長さは calculatedLevel になる。
            parentStack.length = calculatedLevel;
            const parentNode = parentStack[calculatedLevel - 1];

            if (!parentNode) {
                console.error(`P1-Mermaid PARENT UNDEFINED. Target Parent Level: ${calculatedLevel - 1}, Node: "${nodeTextWithBr}"`);
                console.error(`P1-Mermaid Stack:`, parentStack.map(n => n ? n.name : 'undef'));
                // ここでエラーになった場合、インデントの飛びすぎなどが考えられる
                return { error: `(P1-Mermaid) No parent for "${nodeTextWithBr}" (level ${calculatedLevel}). Indent: ${currentIndent}.` };
            }

            const newNode = { name: nodeTextWithBr, children: [] };
            parentNode.children.push(newNode);
            parentStack[calculatedLevel] = newNode; // 現在のノードをそのレベルの親としてスタック
            lastIndent = currentIndent; // lastIndent はここでは直接使っていないが、より高度なロジックで使える
        }
        return rootJsonNode;
    }

    function convertAndDisplay() {
        console.log("[convertAndDisplay] Called.");
        const inputText = mindmapInput.value;
        const selectedPattern = outputPatternSelect.value;
        console.log(`[convertAndDisplay] Selected pattern: ${selectedPattern}`);

        const pattern1Result = mindMapTextToJson(inputText);
        // ログが見やすいようにディープコピー
        console.log("[convertAndDisplay] Intermediate Pattern 1 Result:", pattern1Result ? JSON.parse(JSON.stringify(pattern1Result)) : pattern1Result);


        let finalResult;
        if (pattern1Result && pattern1Result.error) {
            finalResult = pattern1Result;
        } else if (pattern1Result) {
            if (selectedPattern === 'pattern2') {
                console.log("[convertAndDisplay] Converting Pattern 1 to Pattern 2.");
                if (pattern1Result.children) {
                    finalResult = convertPattern1ToPattern2(pattern1Result.children);
                } else {
                    finalResult = {};
                    console.warn("[convertAndDisplay] Pattern 1 result had no children for Pattern 2 conversion.");
                }
            } else {
                finalResult = pattern1Result;
            }
        } else {
            finalResult = { error: "Parser returned undefined result." };
        }

        console.log("[convertAndDisplay] Final Result to display:", finalResult);

        jsonOutputElement.classList.remove('error');
        jsonOutputElement.style.border = "1px solid #ccc";
        jsonOutputElement.style.backgroundColor = "#e9e9e9";
        jsonOutputElement.style.padding = "15px";

        if (finalResult && finalResult.error) {
            console.error("[convertAndDisplay] Error in final result:", finalResult.error);
            jsonOutputElement.textContent = `Error: ${finalResult.error}`;
            jsonOutputElement.classList.add('error');
            // ... (error styling)
            jsonOutputElement.style.border = "1px solid red";
            jsonOutputElement.style.backgroundColor = "#ffebeb";
            jsonOutputElement.style.padding = "10px";

        } else if (finalResult) {
            console.log("[convertAndDisplay] Conversion successful. Displaying JSON.");
            jsonOutputElement.textContent = JSON.stringify(finalResult, null, 2);
        } else {
            console.error("[convertAndDisplay] Final result is undefined or null.");
            jsonOutputElement.textContent = `Error: Unexpected error (final result is null/undefined).`;
            jsonOutputElement.classList.add('error');
        }
    }

    if (convertButton) {
        convertButton.addEventListener('click', convertAndDisplay);
    }
    console.log("Script loaded and initialized.");
});