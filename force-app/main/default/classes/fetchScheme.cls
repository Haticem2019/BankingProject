public with sharing class fetchScheme {

  @AuraEnabled(cacheable=true)
  public static FD_Details__c fetchCustomerType(string fdId){
      return [SELECT Customer_Type__c, Id 
      FROM FD_Details__c 
      WHERE Id=:fdId
      WITH SECURITY_ENFORCED];
  }


  @AuraEnabled 
  public static list<Interest_Scheme__c> fetchInterestScheme(string custType, string depType, integer tenMonths, integer tenorDays, integer fdAmount, string fdId){

      return [SELECT Id, Name, Tenor_From_Days__c, Tenor_To_Days__c, Tenor_From_Months__c, Tenor_To_Months__c, Customer_Type__c, Interest_Rate__c, Deposit_Type__c, From_Amount__c, To_Amount__c 
      FROM Interest_Scheme__c
      WHERE Customer_Type__c=:custType 
      AND Deposit_Type__c=:depType
      AND Tenor_From_Days__c<=:tenorDays
      AND Tenor_To_Days__c>=:tenorDays
      AND Tenor_From_Months__c<=:tenMonths
      AND Tenor_To_Months__c>=:tenMonths
      AND From_Amount__c<=:fdAmount
      AND To_Amount__c>=:fdAmount 
      WITH SECURITY_ENFORCED];
      

      
  }

  // dml -> update -> cause we are updating an existing record values with the ones user entered
  @AuraEnabled
  public static void updateFD(string depType,string payFreq, integer tenMonths,integer tenDays, decimal fdAmount, string inScheme, string fdId, decimal inRate ){

      FD_Details__c fd=new FD_Details__c();//object - instance
      fd.Id=fdId;
      fd.Deposit_Type__c=depType;
      fd.Payout_Frequency__c=payFreq;
      fd.Tenor_in_Months__c=tenMonths;
      fd.Tenor_in_Days__c=tenDays;
      fd.FD_Amount__c=fdAmount;
      fd.Interest_Scheme__c=inScheme;
      fd.Interest_Rate__c=inRate;
      update fd;



      
      
  }





}