//Instaciamos al driver de selenium
const {Builder, By, Key, util} = require("selenium-webdriver");


async function example(){
   let driver = await new Builder()
   .forBrowser('chrome')
   .build();
   await driver.get("https://www.google.com/");
   await driver.findElement(By.name("q")).sendKeys("Selenium", Key.ENTER); 
  

}
example();
