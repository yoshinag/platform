document.addEventListener('DOMContentLoaded',()=>{
  const birthdateInput=document.getElementById('birthdate');
  const referenceDateInput=document.getElementById('referenceDate');
  const calculateAgeButton=document.getElementById('calculateAgeButton');
  const resultDiv=document.getElementById('result');
  const subtract10YearsButton=document.getElementById('subtract10Years');
  const subtract5YearsButton=document.getElementById('subtract5Years');
  const subtract1YearButton=document.getElementById('subtract1Year');
  const add1YearButton=document.getElementById('add1Year');
  const add5YearsButton=document.getElementById('add5Years');
  const add10YearsButton=document.getElementById('add10Years');

  // 干支（えと）の配列
  const zodiacSigns = [
    "子（ね）", // Rat
    "丑（うし）", // Ox
    "寅（とら）", // Tiger
    "卯（う）", // Rabbit
    "辰（たつ）", // Dragon
    "巳（み）", // Snake
    "午（うま）", // Horse
    "未（ひつじ）", // Goat
    "申（さる）", // Monkey
    "酉（とり）", // Rooster
    "戌（いぬ）", // Dog
    "亥（い）" // Pig
  ];

  // 干支を取得する関数
  const getZodiacSign = (year) => {
    // 干支は子（ね）から始まり、12年周期で繰り返す
    // 子年は、西暦を12で割った余りが4の年（例：2020年、2008年、1996年など）
    const remainder = (year - 4) % 12;
    return zodiacSigns[remainder >= 0 ? remainder : remainder + 12];
  };

  const displayFeedback=(message,type='info')=>{
    resultDiv.textContent=message;
    resultDiv.className=type;
  };

  const formatDateToYMD=(date)=>{
    if(!date||isNaN(date.getTime()))return '';
    const y=date.getFullYear();
    const m=String(date.getMonth()+1).padStart(2,'0');
    const d=String(date.getDate()).padStart(2,'0');
    return`${y}-${m}-${d}`;
  };

  birthdateInput.value="2000-06-01";
  referenceDateInput.value=formatDateToYMD(new Date());

  const adjustYear=(years)=>{
    const dateVal=birthdateInput.value;
    let targetDate;
    if(!dateVal){
      targetDate=new Date();
    }else{
      targetDate=new Date(dateVal.replace(/-/g,'/'));
      if(isNaN(targetDate.getTime()))targetDate=new Date();
    }
    targetDate.setFullYear(targetDate.getFullYear()+years);
    birthdateInput.value=formatDateToYMD(targetDate);
  };

  subtract10YearsButton.addEventListener('click',()=>adjustYear(-10));
  subtract5YearsButton.addEventListener('click',()=>adjustYear(-5));
  subtract1YearButton.addEventListener('click',()=>adjustYear(-1));
  add1YearButton.addEventListener('click',()=>adjustYear(1));
  add5YearsButton.addEventListener('click',()=>adjustYear(5));
  add10YearsButton.addEventListener('click',()=>adjustYear(10));

  calculateAgeButton.addEventListener('click',()=>{
    const birthdateVal=birthdateInput.value;
    const referenceDateVal=referenceDateInput.value;

    if(!birthdateVal){
      displayFeedback('生年月日を選択してください。','error');
      return;
    }
    if(!referenceDateVal){
      displayFeedback('基準日を選択してください。','error');
      return;
    }

    const birthDate=new Date(birthdateVal.replace(/-/g,'/'));
    const referenceDate=new Date(referenceDateVal.replace(/-/g,'/'));

    if(isNaN(birthDate.getTime())){
      displayFeedback('有効な生年月日を入力してください。','error');
      return;
    }
    if(isNaN(referenceDate.getTime())){
      displayFeedback('有効な基準日を入力してください。','error');
      return;
    }

    const birthDateOnly=new Date(birthDate.getFullYear(),birthDate.getMonth(),birthDate.getDate());
    const referenceDateOnly=new Date(referenceDate.getFullYear(),referenceDate.getMonth(),referenceDate.getDate());

    if(birthDateOnly>referenceDateOnly){
      displayFeedback('生年月日は基準日より過去の日付にしてください。','error');
      return;
    }

    let age=referenceDate.getFullYear()-birthDate.getFullYear();
    const monthDiff=referenceDate.getMonth()-birthDate.getMonth();
    const dayDiff=referenceDate.getDate()-birthDate.getDate();

    if(monthDiff<0||(monthDiff===0&&dayDiff<0)){
      age--;
    }

    const refDateFormatted=formatDateToYMD(referenceDate);
    const zodiacSign = getZodiacSign(birthDate.getFullYear());
    displayFeedback(`${refDateFormatted} 時点の年齢は ${age} 歳です。生まれ年の干支は ${zodiacSign} です。`,'success');
  });
});
