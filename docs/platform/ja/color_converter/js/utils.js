// --- START OF FILE utils.js ---
/**
 * 値を安全な整数に変換する関数
 * 
 * @param {*} value - 整数に変換する値
 * @param {number} defaultValue - 変換できない場合や負の値の場合のデフォルト値（デフォルトは0）
 * @returns {number} - 安全な整数値
 * 
 * この関数は入力値を整数に変換し、変換できない場合や負の値の場合はデフォルト値を返します。
 * 主に入力フィールドからの値を処理する際に使用されます。
 */
function getSafeInt(value, defaultValue = 0) {
    const num = parseInt(value, 10);
    return isNaN(num) || num < 0 ? defaultValue : num;
}

/**
 * 値を安全な正の整数に変換する関数
 * 
 * @param {*} value - 正の整数に変換する値
 * @param {number} defaultValue - 変換できない場合や0以下の値の場合のデフォルト値（デフォルトは1）
 * @returns {number} - 安全な正の整数値
 * 
 * この関数は入力値を正の整数に変換し、変換できない場合や0以下の値の場合はデフォルト値を返します。
 * 主に数量や倍率などの正の値が必要な場合に使用されます。
 */
function getSafePositiveInt(value, defaultValue = 1) {
    const num = parseInt(value, 10);
    return isNaN(num) || num <= 0 ? defaultValue : num;
}

/**
 * 16進数カラーコードをRGB形式に変換する関数
 * 
 * @param {string} hex - 変換する16進数カラーコード（例: '#FF0000'）
 * @returns {Object} - {r, g, b}形式のRGBオブジェクト
 * 
 * この関数は16進数形式のカラーコードを受け取り、RGBの各成分（赤、緑、青）に分解します。
 * 返されるオブジェクトのプロパティr、g、bはそれぞれ0〜255の範囲の整数値です。
 */
function hexToRgb(hex) {
    // ハッシュ記号が存在する場合は削除
    hex = hex.replace(/^#/, '');

    // 16進数の値を解析
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
}

/**
 * 16進数カラーコードとアルファ値をRGBA形式に変換する関数
 * 
 * @param {string} hex - 変換する16進数カラーコード（例: '#FF0000'）
 * @param {number} alpha - アルファ値（0〜1の範囲、0が完全に透明、1が完全に不透明）
 * @returns {Object} - {r, g, b, a}形式のRGBAオブジェクト
 * 
 * この関数は16進数形式のカラーコードとアルファ値を受け取り、RGBAの各成分に分解します。
 * 返されるオブジェクトのプロパティr、g、bはそれぞれ0〜255の範囲の整数値、aは0〜1の範囲の浮動小数点数です。
 */
function hexToRgba(hex, alpha) {
    const rgb = hexToRgb(hex);
    return { ...rgb, a: alpha };
}

/**
 * RGB値を16進数カラーコードに変換する関数
 * 
 * @param {number} r - 赤成分（0〜255）
 * @param {number} g - 緑成分（0〜255）
 * @param {number} b - 青成分（0〜255）
 * @returns {string} - '#'で始まる16進数カラーコード
 * 
 * この関数はRGBの各成分を受け取り、Webで使用される標準的な16進数カラーコード（例: '#FF0000'）に変換します。
 * ビット演算を使用して効率的に変換を行います。
 */
function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * 2つの色のRGB空間での距離を計算する関数
 * 
 * @param {Object} color1 - 1つ目の色（{r, g, b}形式）
 * @param {Object} color2 - 2つ目の色（{r, g, b}形式）
 * @returns {number} - 2つの色の間のユークリッド距離
 * 
 * この関数は2つの色のRGB値を受け取り、3次元RGB空間でのユークリッド距離を計算します。
 * この距離は色の類似性を測る指標として使用でき、値が小さいほど色が似ていることを示します。
 * 色の類似性検索や最も近い色を見つける際に役立ちます。
 */
function colorDistance(color1, color2) {
    // RGB空間での2つの色のユークリッド距離を計算
    return Math.sqrt(
        Math.pow(color1.r - color2.r, 2) +
        Math.pow(color1.g - color2.g, 2) +
        Math.pow(color1.b - color2.b, 2)
    );
}
// --- END OF FILE utils.js ---
