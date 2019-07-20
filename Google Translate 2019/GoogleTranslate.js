const chromeOption = require('selenium-webdriver/chrome');
var webdriver = require ('selenium-webdriver') ,
 By = webdriver.By;
 fs = require('fs');
 var parser = require('csv-parse');
var chrome = require('chromedriver');
var driver = new webdriver.Builder()
 .forBrowser('chrome')
 .build();
  driver.get('https://translate.google.com/');
  const CsvFilePath = './Excel Files/translations.csv';
  var languages = require('./languages.js').languages;
  var CsvData = {
    text : [] ,
    language : [] ,
  };
var count = 0 ; var index = 0; var finalData = [];
Pause(1,ReadCsvFile);

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

function ScrapeGoogleTranslate(){
  console.log("Running ScrapeGoogleTranslate function...");
  Pause(2,function(){
    if (count != CsvData.text.length) {
      if (CsvData.text[count].length<=5000) {
      driver.findElement(By.id('source')).sendKeys(CsvData.text[count]);
      console.log(CsvData.text[count].length);
      driver.findElement(By.className('tl-more tlid-open-target-language-list')).click();
      var sourceDelay = GetSourceDelay();
      console.log("Time required in seconds for Jazeb Internet Connection = " + sourceDelay);
      Pause(sourceDelay, function(){
        if (languages[0][CsvData.language[count].toLowerCase()]) {
           var ids = languages[0][CsvData.language[count].toLowerCase()];
          console.log("language exists");
           var targetLanguageId = ids.trim();
           console.log(targetLanguageId);
          driver.findElement(By.xpath('//div[@class="language_list_item_wrapper language_list_item_wrapper-'+targetLanguageId+'"]')).click().catch(function(exception){
            console.log("Exception caught 1 ");
          });
          driver.findElement(By.xpath('//div[@class="language_list_item_wrapper language_list_item_wrapper-'+targetLanguageId+'item-selected item-emhasized"]')).click().catch(function(exception){
            console.log("Exception caught 2 ");
          });
          driver.findElement(By.xpath('//div[@class="language_list_item_wrapper language_list_item_wrapper-'+targetLanguageId+'item-emhasized"]')).click().catch(function(exception){
            console.log("Exception caught 3 ");
          });
          driver.findElement(By.xpath('//div[@class="language_list_item_wrapper language_list_item_wrapper-'+targetLanguageId+'item-selected"]')).click().catch(function(exception){
            console.log("Exception caught 4 ");
          });
          var targetDelay = GetTargetDelay();
          Pause(targetDelay,function(){
            driver.findElement(By.xpath('//span[@class="tlid-translation translation"]')).getText().then(function(translatedText){
              console.log(translatedText);
              finalData.push({
                text: "\""+CsvData.text[count]+"\"",
                languageToTranslateText: "\""+CsvData.language[count]+"\"",
                translatedText: "\""+translatedText+"\""
              });
              AddDataToExcel(finalData);
              driver.findElement(By.id('source')).clear();
              count++;
              ScrapeGoogleTranslate();
            });
          });
        }else {
          console.log("language not found on Google. ");
          driver.findElement(By.className('tl-more tlid-open-target-language-list')).click();
          finalData.push({
            text: "\""+CsvData.text[count]+"\"",
            languageToTranslateText: "\""+CsvData.language[count]+"\"",
            translatedText:'Language Not Found.'
          });
          AddDataToExcel(finalData);
          driver.findElement(By.id('source')).clear();
          count++;
          ScrapeGoogleTranslate();
        }
      });
    }else {
      console.log("The text that need to be translated limited to 5000 characters only.");
      finalData.push({
        text: "\""+CsvData.text[count]+"\"",
        languageToTranslateText: "\""+CsvData.language[count]+"\"",
        translatedText:'The text that need to be translated limited to 5000 characters only.'
      });
      AddDataToExcel(finalData);
      driver.findElement(By.id('source')).clear();
      count++;
      ScrapeGoogleTranslate();
    }
  }else {
    console.log("All data has been parsed");
    QuitDriver();
  }
  });
}
function AddDataToExcel (array) {

 fs.appendFileSync('./excel files/translatedData.csv', ''
 + array[index].text + ','
 + array[index].languageToTranslateText + ','
 + array[index].translatedText + ','
 + '\n');
 array = [];
 index++;
}

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

function GetTargetDelay()  {
	var length = CsvData.text[count].length, delayFactor = 2;
	if (length >= 2500 && length <= 5000) {
		delayFactor = 5;
	}
	return delayFactor;
}

function Pause(Time,FuncName){
  setTimeout(FuncName,Time*1000);
}
function QuitDriver(){
  driver.close();
  driver.quit();
}
