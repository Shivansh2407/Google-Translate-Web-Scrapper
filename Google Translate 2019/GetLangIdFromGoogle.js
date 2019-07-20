const chromeOptions = require('selenium-webdriver/chrome');
var webdriver = require ('selenium-webdriver') ,
 By = webdriver.By;
var chrome = require('chromedriver');
var driver = new webdriver.Builder()
 .forBrowser('chrome')
 .setChromeOptions(new chromeOptions.Options().headless())
 .build();
 fs = require('fs');

  driver.get('https://translate.google.com'); //getting the URL
 var count = 2, length = 0;
 results ={
   arrayLang : [],
   arrayIndex: [],
 }, finalData = '';
Pause(4,OpenLanguageBox);
function OpenLanguageBox(){
  driver.findElement(By.className('tl-more tlid-open-target-language-list')).click();
  //console.log("Button Clicked! ");
  Pause(4,GetId);
}
function GetId(){
  var ids = '';
  Pause(1,function(){
    if(count != 106){
      //script for getting languge id
      driver.findElement(By.xpath('//div[@class="language-list-unfiltered-langs-tl_list"]/div[2]/div['+(count)+']')).getAttribute('class').then(function(id){
        console.log(id);
        if(typeof id.split('-')[1] != 'undefined' && typeof id.split('-')[2] != 'undefined'){
          ids = id.split('-')[1] + "-" + id.split('-')[2]; // Chineses lang where we have 2 -
        }else {
          ids = id.split('-')[1]; // For all the languages
        }
        var finalId = ids.replace('item-selected','');
        console.log(finalId);
        results.arrayIndex.push(finalId);
        count++;
        GetId();
      });
    }else {
      count = 0;
      Pause(1,GetLanguageRelatedToId);
    }

  });

}
function GetLanguageRelatedToId(){
  if (count != results.arrayIndex.length ) {
    Pause(1,function(){
      driver.findElement(By.xpath('//div[@class="language_list_item_wrapper language_list_item_wrapper-'+results.arrayIndex[count]+'"]/div[2]')).getText().then(function(txt){
        if (txt=='') {                    //it means, we have a default language text i.e English
          results.arrayLang.push('English');
        }else {                          // Pushing rest languages
          results.arrayLang.push(txt);
        }
        console.log(txt);
        count ++;
        GetLanguageRelatedToId();
      });

    });

  }else{
   Pause(2,AppendToArray);
  }
}


function AppendToArray(){
  var languages = {}, lang ='',id = '';
  for (var i = 0; i < results.arrayIndex.length; i++) {
    lang = results.arrayLang[i];
    id   = results.arrayIndex[i];
    languages[lang.toLowerCase()] = id;
  }
  finalData = "exports.languages = ["+JSON.stringify(languages)+"];"
  Pause(1,CheckFileExistance);
}

function CheckFileExistance(){
fs.stat('languges.js',function(err,stats){
  if (!err) {
    //delete the file if it exists
    fs.unlink('languages.js',function(err){
      if(err) err;
      console.log("The previous file  deleted. And a New file has been added");
      AppendToFile();
    });

  }else {
    AppendToFile();
  }
});
}

function AppendToFile(){
  console.log("Data Added in languages.js file");
  fs.appendFileSync('languages.js',''+finalData+'\n');
  QuitDriver();
}


function Pause(Time,FuncName){
  setTimeout(FuncName,Time*1000);
}

function QuitDriver(){
  driver.close();
  driver.quit();
}
