public with sharing class applicantDetails {
    
    // wrapper class ->
    public class ApplicantWrapper{
        @AuraEnabled 
        public list<FD_Applicant_Junction__c> appJuncList;
        
        @AuraEnabled 
        public boolean isSuccess;
        @AuraEnabled
        public string errorMessage;
    }
    @AuraEnabled
    public static ApplicantWrapper saveRecords(string appType, string fdId, Applicant_Details__c objApp ){
        list<Applicant_Details__c> appList=[SELECT Id FROM Applicant_Details__c
                                                        WHERE SSN__c=:objApp.SSN__c];
    // ssn must be unique , if the above list is not empty it means there is at least a record which has the same ssn number 
    // fistname, lsat name
    if(!appList.isEmpty()){
        objApp.Id=appList[0].Id;
    }
    upsert objApp;
    // if the appList is not empty it will mean ssn is exist -> in this case it will update the record, 
    // if the appList is empty it means ssn is not used before in system -> in this case it will insert the record .
    list<FD_Applicant_Junction__c> juncRecords=[SELECT Id FROM FD_Applicant_Junction__c
                                                            WHERE FD_Details__c=:fdId 
                                                            AND Applicant_Details__c=:objApp.Id];
        //I created an instance of ApplicantWrapper class , because the variables i have in that class are non static , you can not reach without instance. 
        ApplicantWrapper objectWrapper =new ApplicantWrapper();
        
        // I gave initial values to my variables below;
        objectWrapper.isSuccess=true;
        objectWrapper.errorMessage='';
        if(!juncRecords.isEmpty()){
            objectWrapper.isSuccess=false;
            objectWrapper.errorMessage='This data is created before so please chose different values!';
        }else if(objectWrapper.isSuccess){
            FD_Applicant_Junction__c juncInstance = new FD_Applicant_Junction__c(FD_Details__c=fdId,     Applicant_Details__c=objApp.Id, Type__c= appType);
            insert juncInstance;
        }
        return objectWrapper;
        
    }
    }