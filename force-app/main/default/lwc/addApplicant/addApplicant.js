import { LightningElement, api, wire } from 'lwc';
import { getObjectInfo, getPicklistValues } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import saveRecords from '@salesforce/apex/applicantDetails.saveRecords';
import FD_APPLICANT_JUNCTION_OBJECT from '@salesforce/schema/FD_Applicant_Junction__c';
import TYPE_FIELD from '@salesforce/schema/FD_Applicant_Junction__c.Type__c';
/* https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_lightning_ui_api_object_info */
export default class AddApplicantDT extends LightningElement {
    // first we have to declare our variables
    // as best practice we always declare our variables at the top of the file
    applicantTypeValue;
    applicantTypeOptions=[];
    @api recordId;
    //I will put in this applicantObject all the data as key and value 
    //later on in my apex class i will use this object to create a
    //applicant record.
    applicantObject={};
    // at the begginnnig we want button to be active 
    //thats why we put false 
    // because it shouldnt be disabled , and we use this 
    // variable for disabled attribute which i have in html 
    showAddApplicant=false;
    @wire(getObjectInfo,{objectApiName:FD_APPLICANT_JUNCTION_OBJECT})
    fdAppJuncData;
    // fdAppJuncData({data,error}){
    //     if(data){
    //         console.log(data);
    //     }else if(error){
    //         console.log(error);
    //     }
    // }
    @wire(getPicklistValues,{fieldApiName:TYPE_FIELD ,recordTypeId:'$fdAppJuncData.data.defaultRecordTypeId'})
    fdApplicantTypeData({data,error}){
    if(data){
        console.log(data);
        let options=[];
        data.values.forEach(e=>{
            options.push({
                label:e.label,
                value:e.value
            })
            console.log(`e.label ${e.label}`)
            console.log(`e.value ${e.value}`)
        })
        this.applicantTypeOptions=options;
    }else if(error){
        console.log(error);
    }
    }
    applicantTypeHandleChange(event){
        this.applicantTypeValue=event.target.value;
        console.log(`the chosen applicant type value is ${this.applicantTypeValue}`);
    }
    // when the button is clicked we check the validity 
    addApplicantHandler(){
        let isValid=true;
        let applTypeData=this.template.querySelectorAll('.validateCombobox');
        applTypeData.forEach(e=>{
            if(!e.checkValidity()){
                // if the values are not valid then we report validity
                e.reportValidity();
                isValid=false;
            }
        })
        // if the values are valid then we disable the button
        if(isValid){
            this.showAddApplicant=true;
        }
    }
// ctrl+/ -> is short key to comment out
    
    //Long way 
    // firstNameHandler(event){
    //     this.applicantObject.First_Name__c= event.target.value;
    // }
    // lastNameHandler(event){
    //     this.applicantObject.Last_Name__c=event.target.value;
    // }
    // ssnHandler(event){
    //     this.applicantObject.SSN__c=event.target.value;
    // }
    // dateOfBirthHandler(event){
    //     this.applicantObject.Date_Of_Birth__c=event.target.value;
    // }
    // mobileHandler(event){
    //     this.applicantObject.Mobile__c=event.target.value;
    // }
    // emailHandler(event){
    //     this.applicantObject.Email__c=event.target.value;
    // }
    // addressHandler(event){
    //     this.applicantObject.Address__c=event.target.value;
    // }
    handleChange(event){
        // 1. step 
        // const name=event.target.name;//SSN__c
        // const value=event.target.value;//467465343
        // this.applicantObject[name]=value;
        // 2. step
        // const name=event.target;//SSN__c
        // const value=event.target;//467465343
        // this.applicantObject[name]=value;
        const {name,value}=event.target;
        this.applicantObject[name]=value;
    }
/*!SECTION
{
    First_Name__c:'jane',
    Last_Name__c:'blue',
    ....
}
*/
    /////////////////// 
    saveHandler(){
        //check the validity 
        let isValid=true;
        let inputFields=this.template.querySelectorAll('lightning-input');
        inputFields.forEach(e=>{
            if(!e.checkValidity()){//if 6 fields data are not valid
                e.reportValidity();//it will stop the application
                isValid=false;//not valid anymore
            }
        })
        //isValid=true
        let addressVal=this.template.querySelectorAll('lightning-textarea');
        addressVal.forEach(e=>{
            if(!e.checkValidity()){
                e.reportValidity();
                isValid=false;
            }
        })
        if(isValid){
            console.log(`isValid ${isValid}`)
            // imperative apex
            // as parameter i will send the object ,
            //record id , type field 
            saveRecords({
                appType:this.applicantTypeValue,
                fdId:this.recordId,
                objApp:this.applicantObject
            })
                .then(result => {
                    console.log(result);
                    this.dispatchEvent(new ShowToastEvent({
                        title: "Success!!",
                        message: "The record is created succesfully!!!",
                        variant: "success"
                    }));
                })
                .catch(error => {
                    console.log(error);
                    this.dispatchEvent(new ShowToastEvent({
                        title: "Error Occured!!",
                        message: "An error occured so we couldnt save the record , please check below error message"+JSON.stringify(error),
                        variant: "error"
                    }));
                });
        }
    }
    
}