const chromeOption = require('selenium-webdriver/chrome');
var webdriver = require ('selenium-webdriver') ,
 By = webdriver.By;
 fs = require('fs');
var chrome = require('chromedriver');
var driver = new webdriver.Builder()
 .forBrowser('chrome')
 .setChromeOptions(new chromeOption.Options().headless()) //headless means work in the background without opening a browser
 .build();
  driver.get('https://translate.google.com/');



Pause(2,OpenLanguageBox);

var count = 0 , length = 0;
results = {
  arrayLang: [],
  arrayIndex: [],
}, finalData = '';

/**
 * Opens the language box and takes the length of all languages supported by google
 */
function OpenLanguageBox(){
driver.findElement(By.id('gt-tl-gms')).click();
Pause(3,function(){
  driver.findElements(By.className('goog-menuitem goog-option')).then(function(element){
    length = element.length;
  });
  Pause(4,GetID);
});
}
/**
 * Gets the lang id and save into results.arrayIndex
 */
function GetID(){
  Pause(1,function(){
    if( count != length ){
    driver.findElements(By.className('goog-menuitem goog-option')).then(function(element){
      element[count].getAttribute('id').then(function(id){
        results.arrayIndex.push(id);
        console.log(id + "\n");
        count ++;
        GetID();
      });
    });
  }else {
    count = 0;
    Pause(1,GetLanguageRelatedToID);
  }
});
}
/**
 * Gets the language related to id that generates in above method
 * Saves that lang into results.arrayLang
 */
function GetLanguageRelatedToID(){
  if ( count != length ){
    Pause(1,function(){
      driver.findElement(By.id(results.arrayIndex[count])).getText().then(function(txt){
        results.arrayLang.push(txt);
        console.log(txt + "\n");
        count ++;
        GetLanguageRelatedToID();
      });
    });
  }else {
    Pause(2,AppendToArray);
  }
}
/**
 * Appends the data to languages array based on lang : id pair
 * Finally saves that data to finalData array
 */

function AppendToArray(){
  var languages = {} , lang = '', id = '';
  for (var i = 0; i < length ; i++) {
    lang = results.arrayLang[i];
    id   = results.arrayIndex[i];
    languages[lang.toLowerCase()] = id ;
  }
  finalData = "exports.languages = ["+ JSON.stringify (languages) + "];"
  Pause(1, CheckFileExistance)
}
/**
  * Deletes the file languages.js file if it exists before.
 */
function CheckFileExistance(){
  fs.stat('languages.js',function(error,stats){
    if(!error){
      fs.unlink('languages.js',function(error){
        if(error) error;
        console.log("The Previous file is deleted and replaced with a new File");
        AppendToFile();
      });
    }else{
      AppendToFile();
    }
  });
}

/**
 * Appends the resultant data to languages.js file which would be used in googleTranslate.js
 */
function AppendToFile(){
  console.log("Data Added in Languages.JS file");
  fs.appendFileSync('languages.js',''+ finalData + '\n');
  QuitDriver();
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
