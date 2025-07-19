// SVG Icon definitions
const SVG_ICON_COPY = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
const SVG_ICON_COPY_SUCCESS = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>';

const definedTimezones = {
  'JST': { name: 'JST (Japan Standard Time)', iana: 'Asia/Tokyo', standardOffsetHours: 9, supportsDst: false },
  'UTC': { name: 'UTC (Coordinated Universal Time)', iana: 'Etc/UTC', standardOffsetHours: 0, supportsDst: false },
  'GMT': { name: 'GMT (Greenwich Mean Time)', iana: 'Etc/GMT', standardOffsetHours: 0, supportsDst: false },
  'PST': { name: 'PST (Pacific Standard Time)', iana: 'America/Los_Angeles', standardOffsetHours: -8, supportsDst: true },
  'EST': { name: 'EST (Eastern Standard Time)', iana: 'America/New_York', standardOffsetHours: -5, supportsDst: true },
  'CST': { name: 'CST (Central Standard Time)', iana: 'America/Chicago', standardOffsetHours: -6, supportsDst: true },
  'CET': { name: 'CET (Central European Time)', iana: 'Europe/Berlin', standardOffsetHours: 1, supportsDst: true },
  'AST': { name: 'AST (Arabia Standard Time)', iana: 'Asia/Riyadh', standardOffsetHours: 3, supportsDst: false }
};

document.addEventListener('DOMContentLoaded', function() {
  const baseTimezoneSelect = document.getElementById('baseTimezone');
  const dateInput = document.getElementById('dateInput');
  const timeInput = document.getElementById('timeInput');
  const dstToggleContainer = document.getElementById('dstToggleContainer');
  const applyDstCheckbox = document.getElementById('applyDstCheckbox');
  const convertButton = document.getElementById('convertButton');
  const dateFormatSelect = document.getElementById('dateFormatSelect');
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
  dateInput.addEventListener('change', performConversion);
  timeInput.addEventListener('change', updateDstCheckboxState);
  timeInput.addEventListener('change', performConversion);
  baseTimezoneSelect.addEventListener('change', updateDstCheckboxState);
  baseTimezoneSelect.addEventListener('change', performConversion);
  applyDstCheckbox.addEventListener('change', performConversion);

  // Function to format date based on selected format
  function formatDateWithSelectedFormat(date, timezone) {
    const formatValue = dateFormatSelect.value;
    let options = {
      timeZone: timezone,
      hourCycle: 'h23'
    };

    // Set format options based on selected format
    if (formatValue === 'ja-JP') {
      options = {
        ...options,
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      };
      return new Intl.DateTimeFormat('ja-JP', options).format(date);
    } else if (formatValue === 'ja-JP-u-ca-japanese') {
      options = {
        ...options,
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        era: 'long', calendar: 'japanese'
      };
      return new Intl.DateTimeFormat('ja-JP-u-ca-japanese', options).format(date);
    } else if (formatValue === 'ja-JP-hyphen') {
      options = {
        ...options,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      };
      return new Intl.DateTimeFormat('ja-JP', options).format(date).replace(/\//g, '-');
    } else if (formatValue === 'ja-JP-slash') {
      options = {
        ...options,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      };
      return new Intl.DateTimeFormat('ja-JP', options).format(date);
    } else if (formatValue === 'en-US') {
      options = {
        ...options,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      };
      return new Intl.DateTimeFormat('en-US', options).format(date);
    } else if (formatValue === 'en-GB') {
      options = {
        ...options,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      };
      return new Intl.DateTimeFormat('en-GB', options).format(date);
    } else if (formatValue === 'iso') {
      // ISO 8601 format
      const isoString = date.toISOString();
      // Convert to target timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hourCycle: 'h23'
      });
      const parts = formatter.formatToParts(date);
      const dateObj = {};
      parts.forEach(part => {
        if (part.type !== 'literal') {
          dateObj[part.type] = part.value;
        }
      });
      return `${dateObj.year}-${dateObj.month}-${dateObj.day}T${dateObj.hour}:${dateObj.minute}:${dateObj.second}`;
    }

    // Default format
    options = {
      ...options,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  }

  // Function to copy text to clipboard
  function copyToClipboard(text, element) {
    const originalTitle = element.title;

    if (!navigator.clipboard) {
      try {
        // Create a temporary textarea element to copy from
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';  // Prevent scrolling to bottom
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        element.innerHTML = SVG_ICON_COPY_SUCCESS;
        element.title = 'Copied!';
      } catch (err) {
        console.error('Fallback copy failed:', err);
        alert('Failed to copy text (execCommand).');
        element.title = 'Copy failed';
      }
    } else {
      navigator.clipboard.writeText(text).then(() => {
        element.innerHTML = SVG_ICON_COPY_SUCCESS;
        element.title = 'Copied!';
      }).catch(err => {
        console.error('Async copy failed:', err);
        alert('Failed to copy text (Clipboard API).');
        element.title = 'Copy failed';
      });
    }

    setTimeout(() => {
      element.innerHTML = SVG_ICON_COPY;
      element.title = originalTitle;
    }, 2000);
  }

  function performConversion() {
    clearError();
    resultTableBody.innerHTML = '';
    const dateValue = dateInput.value;
    const timeValue = timeInput.value;
    const baseTZKey = baseTimezoneSelect.value;
    const useDst = applyDstCheckbox.checked && !applyDstCheckbox.disabled;

    if (!dateValue || !timeValue) { displayError('Please enter date and time.'); return; }
    if (!baseTZKey || !definedTimezones[baseTZKey]) { displayError('Please select a valid base timezone.'); return; }

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
        throw new Error(`Failed to convert base time to UTC. ISO: ${isoStringForBaseUtc}`);
      }
    } catch (error) {
      console.error("Base UTC calculation error:", error);
      displayError(`Base time parsing error: ${error.message}`);
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

        // Format the date using the selected format
        const formattedTargetTime = formatDateWithSelectedFormat(baseTimeUtc, displayIana);

        const newRow = resultTableBody.insertRow();
        if (targetTZKey === baseTZKey) {
          newRow.classList.add('highlight');
        }

        // Timezone name cell
        newRow.insertCell().textContent = targetTzInfo.name + (targetTzInfo.supportsDst && !useDst ? " (Standard Time)" : "");

        // Formatted date cell
        const dateCell = newRow.insertCell();
        dateCell.textContent = formattedTargetTime;

        // Create a data attribute to store the formatted date for copying
        dateCell.setAttribute('data-datetime', formattedTargetTime);

        let offsetDisplayString = "N/A";

        // Offset cell
        const offsetCell = newRow.insertCell();
        if (!isNaN(actualOffsetHours)) {
          const sign = actualOffsetHours >= 0 ? '+' : '-';
          const h = Math.floor(Math.abs(actualOffsetHours));
          const m = Math.round((Math.abs(actualOffsetHours) - h) * 60);
          offsetDisplayString = `UTC${sign}${String(h).padStart(1,'0')}${m > 0 ? `:${String(m).padStart(2,'0')}`: ''}`;
        } else if (targetTzInfo.supportsDst && !useDst) {
          const sign = targetTzInfo.standardOffsetHours >= 0 ? '+' : '-';
          const h = Math.floor(Math.abs(targetTzInfo.standardOffsetHours));
          const m = Math.round((Math.abs(targetTzInfo.standardOffsetHours) - h) * 60);
          offsetDisplayString = `UTC${sign}${String(h).padStart(1,'0')}${m > 0 ? `:${String(m).padStart(2,'0')}`: ''} (Standard)`;
        }
        offsetCell.textContent = offsetDisplayString;

        // Add copy icon cell
        const actionCell = newRow.insertCell();
        actionCell.className = 'action-cell';

        // Create copy icon
        const copyIcon = document.createElement('span');
        copyIcon.innerHTML = SVG_ICON_COPY;
        copyIcon.className = 'copy-icon';
        copyIcon.title = 'Copy date/time';
        copyIcon.setAttribute('data-datetime', formattedTargetTime);

        // Add click event to copy the date
        copyIcon.addEventListener('click', function() {
          const textToCopy = this.getAttribute('data-datetime');
          copyToClipboard(textToCopy, this);
        });

        actionCell.appendChild(copyIcon);
      }
    }
  }

  convertButton.addEventListener('click', performConversion);

  // Add event listener to date format select
  dateFormatSelect.addEventListener('change', performConversion);

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
