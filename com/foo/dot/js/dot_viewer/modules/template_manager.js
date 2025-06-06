/**
 * template_manager.js - テンプレート管理モジュール
 * 
 * このモジュールは、グラフ描画用のテンプレートの管理を担当します。
 * 主な責務:
 * - テンプレートファイルの読み込み
 * - テンプレート選択UIの構築
 * - 選択されたテンプレートのUIへの適用
 */

/**
 * テンプレートファイルを読み込みます
 * @param {string} filePath テンプレートJSONファイルのパス
 * @returns {Promise<Array>} テンプレートの配列
 */
export async function loadTemplatesFromFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, while fetching ${filePath}`);
        }
        const templates = await response.json();
        return templates;
    } catch (error) {
        console.error("テンプレートの読み込みに失敗しました:", error);
        throw error;
    }
}

/**
 * テンプレート選択要素にオプションを設定します
 * @param {HTMLSelectElement} selectElement テンプレート選択のセレクト要素
 * @param {Array} templates テンプレートの配列
 */
export function populateTemplateSelectWithOptions(selectElement, templates) {
    if (!selectElement || !templates) {
        console.warn("セレクト要素またはテンプレート配列がpopulateTemplateSelectに提供されていません。");
        return;
    }
    selectElement.innerHTML = '';
    if (templates.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'テンプレートなし';
        option.disabled = true;
        selectElement.appendChild(option);
        return;
    }
    templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name;
        selectElement.appendChild(option);
    });
    if (templates.length > 0) { // Ensure there's at least one template before setting value
        selectElement.value = templates[0].id;
    }
}

/**
 * 選択されたテンプレートをUIに適用します
 * @param {string} selectedTemplateId 選択されたテンプレートのID
 * @param {Array} allTemplates すべてのテンプレートの配列
 * @param {HTMLTextAreaElement} codeInputElement コード入力要素
 * @param {NodeList} notationRadioElements 記法選択ラジオボタン要素
 * @returns {Object|null} 適用されたテンプレート、または失敗した場合はnull
 */
export function applyTemplateToUI(selectedTemplateId, allTemplates, codeInputElement, notationRadioElements) {
    if (!allTemplates || !codeInputElement || !notationRadioElements) {
        console.warn("applyTemplateToUIに必要な引数が不足しています。");
        return null;
    }
    const selectedTemplate = allTemplates.find(t => t.id === selectedTemplateId);
    if (selectedTemplate) {
        notationRadioElements.forEach(radio => {
            radio.checked = (radio.value === selectedTemplate.notation);
        });
        codeInputElement.value = selectedTemplate.code;
        return selectedTemplate;
    } else if (allTemplates.length > 0 && !selectedTemplateId) {
        const firstTemplate = allTemplates[0];
        notationRadioElements.forEach(radio => {
            radio.checked = (radio.value === firstTemplate.notation);
        });
        codeInputElement.value = firstTemplate.code;
        return firstTemplate;
    }
    console.warn(`ID "${selectedTemplateId}" のテンプレートが見つかりません。`);
    return null;
}
