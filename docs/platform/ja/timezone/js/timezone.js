const definedTimezones = {
  'JST': { name: 'JST (日本標準時)', iana: 'Asia/Tokyo', standardOffsetHours: 9, supportsDst: false },
  'UTC': { name: 'UTC (協定世界時)', iana: 'Etc/UTC', standardOffsetHours: 0, supportsDst: false },
  'GMT': { name: 'GMT (グリニッジ標準時)', iana: 'Etc/GMT', standardOffsetHours: 0, supportsDst: false },
  'PST': { name: 'PST (太平洋標準時)', iana: 'America/Los_Angeles', standardOffsetHours: -8, supportsDst: true },
  'EST': { name: 'EST (東部標準時)', iana: 'America/New_York', standardOffsetHours: -5, supportsDst: true },
  'CST': { name: 'CST (中部標準時)', iana: 'America/Chicago', standardOffsetHours: -6, supportsDst: true },
  'CET': { name: 'CET (中央ヨーロッパ時間)', iana: 'Europe/Berlin', standardOffsetHours: 1, supportsDst: true },
  'AST': { name: 'AST (アラビア標準時)', iana: 'Asia/Riyadh', standardOffsetHours: 3, supportsDst: false }
};

document.addEventListener('DOMContentLoaded', function() {
  const baseTimezoneSelect = document.getElementById('baseTimezone');
  const dateInput = document.getElementById('dateInput');
  const timeInput = document.getElementById('timeInput');
  const dstToggleContainer = document.getElementById('dstToggleContainer');
  const applyDstCheckbox = document.getElementById('applyDstCheckbox');
  const convertButton = document.getElementById('convertButton');
  const resultTableBody = document.getElementById('resultTable').getElementsByTagName('tbody')[0];
  const resultTableContainer = document.getElementById('resultTableContainer');
  const errorMessageDiv = document.getElementById('error-message');

  function populateBaseTimezoneSelect() {
    for (const key in definedTimezones) {
      if (definedTimezones.hasOwnProperty(key)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = definedTimezones[key].name;
        baseTimezoneSelect.appendChild(option);
      }
    }
    baseTimezoneSelect.value = 'JST';
  }

  function displayError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
    resultTableContainer.style.display = 'none';
  }
  function clearError() { errorMessageDiv.textContent = ''; errorMessageDiv.style.display = 'none'; }

  function getCurrentOffsetHours(date, ianaTimeZone) {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: ianaTimeZone,
        hour: 'numeric',
        hourCycle: 'h23',
        timeZoneName: 'longOffset'
      });
      const parts = formatter.formatToParts(date);
      const tzNamePart = parts.find(part => part.type === 'timeZoneName');
      if (tzNamePart && tzNamePart.value) {
        const match = tzNamePart.value.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
        if (match) {
          const sign = match[1] === '+' ? 1 : -1;
          const hours = parseInt(match[2], 10);
          const minutes = match[3] ? parseInt(match[3], 10) : 0;
          return sign * (hours + minutes / 60);
        }
      }
      const etcMatch = ianaTimeZone.match(/Etc\/GMT([+-])(\d+)/);
      if (etcMatch) {
        const sign = etcMatch[1] === '+' ? -1 : 1;
        return sign * parseInt(etcMatch[2], 10);
      }
      if (ianaTimeZone === 'Etc/UTC' || ianaTimeZone === 'Etc/GMT') return 0;
      console.warn("Could not determine offset for", ianaTimeZone, "from", tzNamePart ? tzNamePart.value : "N/A");
      return NaN;
    } catch (e) {
      console.error("Error getting current offset for", ianaTimeZone, e);
      return NaN;
    }
  }

  function getLocalISOStringWithOffset(dateStr, timeStr, baseIana) {
    const localDateForOffsetCalc = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(localDateForOffsetCalc.getTime())) throw new Error("Invalid date/time for offset calculation.");
    let offsetHours = getCurrentOffsetHours(localDateForOffsetCalc, baseIana);
    if (isNaN(offsetHours)) {
      const tzInfo = Object.values(definedTimezones).find(tz => tz.iana === baseIana);
      if (tzInfo) {
        console.warn(`Falling back to standardOffsetHours for ${baseIana}`);
        offsetHours = tzInfo.standardOffsetHours;
      } else {
        throw new Error(`Cannot determine offset for IANA: ${baseIana}`);
      }
    }
    const sign = offsetHours >= 0 ? '+' : '-';
    const absOffsetHours = Math.abs(offsetHours);
    const h = Math.floor(absOffsetHours);
    const m = Math.round((absOffsetHours - h) * 60);
    const offsetString = `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    return `${dateStr}T${timeStr}:00${offsetString}`;
  }

  function updateDstCheckboxState() {
    const dateValue = dateInput.value;
    const timeValue = timeInput.value;
    const baseTZKey = baseTimezoneSelect.value;
    if (!dateValue || !timeValue || !baseTZKey || !definedTimezones[baseTZKey]) {
      dstToggleContainer.style.display = 'none';
      return;
    }
    const tzInfo = definedTimezones[baseTZKey];
    if (!tzInfo.supportsDst) {
      dstToggleContainer.style.display = 'none';
      applyDstCheckbox.checked = false;
      applyDstCheckbox.disabled = true;
      return;
    }
    dstToggleContainer.style.display = 'block';
    const tempDate = new Date(`${dateValue}T${timeValue}`);
    if (isNaN(tempDate.getTime())) {
      applyDstCheckbox.disabled = true;
      return;
    }
    const currentOffset = getCurrentOffsetHours(tempDate, tzInfo.iana);
    const standardOffset = tzInfo.standardOffsetHours;
    if (isNaN(currentOffset)) {
      applyDstCheckbox.disabled = true;
      applyDstCheckbox.checked = false;
      console.warn("Cannot determine if DST is active due to offset error for", tzInfo.iana);
      return;
    }
    const isDstActive = Math.abs(currentOffset - standardOffset) > 0.1;
    applyDstCheckbox.disabled = false;
    applyDstCheckbox.checked = isDstActive;
  }

  dateInput.addEventListener('change', updateDstCheckboxState);
  timeInput.addEventListener('change', updateDstCheckboxState);
  baseTimezoneSelect.addEventListener('change', updateDstCheckboxState);

  function performConversion() {
    clearError();
    resultTableBody.innerHTML = '';
    const dateValue = dateInput.value;
    const timeValue = timeInput.value;
    const baseTZKey = baseTimezoneSelect.value;
    const useDst = applyDstCheckbox.checked && !applyDstCheckbox.disabled;

    if (!dateValue || !timeValue) { displayError('日付と時刻を入力してください。'); return; }
    if (!baseTZKey || !definedTimezones[baseTZKey]) { displayError('有効な基準タイムゾーンを選択してください。'); return; }

    const baseTzInfo = definedTimezones[baseTZKey];
    let baseTimeUtc;
    try {
      let isoStringForBaseUtc;
      if (baseTzInfo.supportsDst && !useDst) {
        const sign = baseTzInfo.standardOffsetHours >= 0 ? '+' : '-';
        const h = Math.floor(Math.abs(baseTzInfo.standardOffsetHours));
        const m = Math.round((Math.abs(baseTzInfo.standardOffsetHours) - h) * 60);
        const fixedOffset = `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        isoStringForBaseUtc = `${dateValue}T${timeValue}:00${fixedOffset}`;
      } else {
        isoStringForBaseUtc = getLocalISOStringWithOffset(dateValue, timeValue, baseTzInfo.iana);
      }
      baseTimeUtc = new Date(isoStringForBaseUtc);
      if (isNaN(baseTimeUtc.getTime())) {
        throw new Error(`基準時刻のUTC変換に失敗。ISO: ${isoStringForBaseUtc}`);
      }
    } catch (error) {
      console.error("Base UTC calculation error:", error);
      displayError(`基準時刻の解析エラー: ${error.message}`);
      return;
    }

    resultTableContainer.style.display = 'block';

    for (const targetTZKey in definedTimezones) {
      if (definedTimezones.hasOwnProperty(targetTZKey)) {
        const targetTzInfo = definedTimezones[targetTZKey];
        let displayIana = targetTzInfo.iana;
        let actualOffsetHours;

        if (targetTzInfo.supportsDst && !useDst) {
          actualOffsetHours = targetTzInfo.standardOffsetHours;
          const sign = actualOffsetHours >= 0 ? '-' : '+';
          const h = Math.abs(actualOffsetHours);
          if (Number.isInteger(h)) {
            displayIana = `Etc/GMT${sign}${Math.floor(h)}`;
            if (actualOffsetHours === 0) displayIana = 'Etc/UTC';
          } else {
            console.warn(`Cannot use fixed Etc/GMT for non-integer standard offset of ${targetTZKey}. Using IANA name which might apply DST.`);
          }
        } else {
          displayIana = targetTzInfo.iana;
          const tempDateForOffset = new Date(baseTimeUtc);
          actualOffsetHours = getCurrentOffsetHours(tempDateForOffset, targetTzInfo.iana);
        }

        const targetFormatter = new Intl.DateTimeFormat('ja-JP', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hourCycle: 'h23',
          timeZone: displayIana,
        });
        const formattedTargetTime = targetFormatter.format(baseTimeUtc).replace(/\//g, '-');
        const newRow = resultTableBody.insertRow();
        if (targetTZKey === baseTZKey) {
          newRow.classList.add('highlight');
        }
        newRow.insertCell().textContent = targetTzInfo.name + (targetTzInfo.supportsDst && !useDst ? " (標準時)" : "");
        newRow.insertCell().textContent = formattedTargetTime;

        let offsetDisplayString = "N/A";
        if (!isNaN(actualOffsetHours)) {
          const sign = actualOffsetHours >= 0 ? '+' : '-';
          const h = Math.floor(Math.abs(actualOffsetHours));
          const m = Math.round((Math.abs(actualOffsetHours) - h) * 60);
          offsetDisplayString = `UTC${sign}${String(h).padStart(1,'0')}${m > 0 ? `:${String(m).padStart(2,'0')}`: ''}`;
        } else if (targetTzInfo.supportsDst && !useDst) {
          const sign = targetTzInfo.standardOffsetHours >= 0 ? '+' : '-';
          const h = Math.floor(Math.abs(targetTzInfo.standardOffsetHours));
          const m = Math.round((Math.abs(targetTzInfo.standardOffsetHours) - h) * 60);
          offsetDisplayString = `UTC${sign}${String(h).padStart(1,'0')}${m > 0 ? `:${String(m).padStart(2,'0')}`: ''} (標準)`;
        }
        newRow.insertCell().textContent = offsetDisplayString;
      }
    }
  }

  convertButton.addEventListener('click', performConversion);

  // Initialize the page
  populateBaseTimezoneSelect();
  const now=new Date();
  dateInput.value=now.toISOString().slice(0,10);
  timeInput.value=now.toTimeString().slice(0,5);
  updateDstCheckboxState();
  clearError();

  // Automatically perform conversion when the page loads
  performConversion();
});
