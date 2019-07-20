const chromeOption = require('selenium-webdriver/chrome');
var webdriver = require ('selenium-webdriver') ,
 By = webdriver.By;
 fs = require('fs');
 var parser = require('csv-parse');

var chrome = require('chromedriver');
var driver = new webdriver.Builder()
 .forBrowser('chrome')
 .setChromeOptions(new chromeOption.Options().headless()) //headless means work in the background without opening a browser
 .build();
  driver.get('https://translate.google.com/');
  const CsvFilePath = './Excel Files/translations.csv';
  var languages = require('./languages.js').languages;
  Pause(1,ReadCsvFile);
  var CsvData = {
    text : [] ,
    language : [] ,
  };
var count = 0 ; var index = 0; var finalData = [];

/**
 * Reads the data from csv file translations.csv file
 * Save data to CsvData.text [contains text from column 1]
 * Save data to CsvData.language [contains language from column 2]
 */
function ReadCsvFile(){
  console.log("Reading CSV File...");
  var parse = parser({delimiter:','},function(error,data){
    data.forEach(function(data){
      CsvData.text.push(data[0]);
      CsvData.language.push(data[1]);
    });
  });
  fs.createReadStream(CsvFilePath).pipe(parse);
  Pause(3,ScrapeGoogleTranslate);

}
/**
 * Sends the source text [CsvData.text[count]] and obtained the translated text
 */

function ScrapeGoogleTranslate(){
  console.log("scrapGoogleTranslate Function is running...");
  Pause(2,function(){
    if ( count != CsvData.text.length){
      if (CsvData.text[count].length <= 5000){
      driver.findElement(By.id('source')).sendKeys(CsvData.text[count]);
      console.log(CsvData.text[count].length);
      driver.findElement(By.id('gt-tl-gms')).click();
      var sourceDelay = GetSourceDelay();
      console.log(sourceDelay)
      Pause(sourceDelay,function(){
        /** here languages[0] contains array langNames : id from languages.js file
				 *  we need to first check that whether the language from csv file [colum 2]
				 *  exists in languages.js file
				 *  if it exists then we have to obtain that language id which is refered as
				 *  targetLanguageId below
				 *  Examples csvData.language[0] = 'afrikaans'
				 *  languages[0][csvData.language[0]] => languages[0]['afrikaans'] yes its exists
				 *  in languages.js file so we have to get this language id i.e targetLanguageId
				 *  var targetLanguageId = languages[0][csvData.language[0], since
				 *  csvData.language[0] contains afrikaans above so languages[0]['afrikaans'] will
				 *  return its id i.e :2y
				 */
        if(languages[0][CsvData.language[count].toLowerCase()]){
          console.log("language exists");
          var targetLanguageId = languages[0][CsvData.language[count].toLowerCase()];
          driver.findElement(By.id(targetLanguageId)).click();
          driver.findElement(By.id('gt-submit')).click();
           var targetDelay = GetTargetDelay();
          Pause(targetDelay,function(){
            driver.findElement(By.xpath('//*[@id="gt-res-dir-ctr"]')).getText().then(function(translatedText){
              console.log(translatedText);
              driver.findElement(By.id('source')).clear();
              finalData.push({
                text: "\""+CsvData.text[count]+"\"",
                languageToTranslateText: "\""+CsvData.language[count]+"\"",
                translatedText: "\""+translatedText+"\""
              });
              count ++;
              AddDataToExcel(finalData);
              ScrapeGoogleTranslate(); // Recursive Call
            });
          });
        }else {
          console.log("Language Not Found");
          finalData.push({
            text: "\""+CsvData.text[count]+"\"",
            languageToTranslateText: "\""+CsvData.language[count]+"\"",
            translatedText:'Language Not Found.'
          });
          count ++;
          AddDataToExcel(finalData);
          ScrapeGoogleTranslate(); // Recursive Call
        }

      });
    }else{
      console.log("The text that need to be translated limited to 5000 characters only.");
      driver.findElement(By.id('source')).clear();
      finalData.push({
        text: "\""+CsvData.text[count]+"\"",
        languageToTranslateText: "\""+CsvData.language[count]+"\"",
        translatedText:'The text that need to be translated limited to 5000 characters only.'
      });
      count ++;
      AddDataToExcel(finalData);
      ScrapeGoogleTranslate(); // Recursive Call
    }
  }else {
    Pause(2,QuitDriver);
  }
  });
}
/**
 * Appends translated data to translatedData.csv file with text, lang source file
 */
function AddDataToExcel (array) {

 fs.appendFileSync('./excel files/translatedData.csv', ''
 + array[index].text + ','
 + array[index].languageToTranslateText + ','
 + array[index].translatedText + ','
 + '\n');
 array = [];
 index++;
}
/**
 * Gets source delayFactor in seconds based on the text length from translations.csv file [column 1]
 */

function GetSourceDelay() {
	var length = CsvData.text[count].length, delayFactor = 2;
	if (length >= 300 && length <= 500) {
		delayFactor = 4;
	} else if (length >= 501 && length <= 1000) {
		delayFactor = 8;
	} else if (length >= 1001 && length <= 2000) {
		delayFactor = 12;
	} else if (length >= 2001 && length <= 3000) {
		delayFactor = 15;
	} else if (length >= 3001 && length <= 4000) {
		delayFactor = 18;
	} else if (length >= 4001 && length <= 5000) {
		delayFactor = 22;
	}
	return delayFactor;
}

/**
 * Gets target delayFactor in seconds based on the text length from translations.csv file [column 1]
 */
function GetTargetDelay()  {
	var length = CsvData.text[count].length, delayFactor = 2;
	if (length >= 2500 && length <= 5000) {
		delayFactor = 5;
	}
	return delayFactor;
}

/**
adding seleinum wait
 * Delay in seconds
 * @param int time
 * @param function func
 */
function Pause(Time,FuncName){
  setTimeout(FuncName,Time*1000);
}

/**
* Closing and then quiting the driver after scrapping has been done
*/
function QuitDriver(){
  driver.close();
  driver.quit();
}
