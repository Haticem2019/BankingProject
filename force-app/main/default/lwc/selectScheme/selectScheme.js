import { LightningElement, api , wire} from 'lwc';
import { getObjectInfo,getPicklistValues } from "lightning/uiObjectInfoApi";
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// import objects and fields from schema
import FD_DETAILS_OBJECT from "@salesforce/schema/FD_Details__c";
import DEPOSIT_TYPE_FIELD from "@salesforce/schema/FD_Details__c.Deposit_Type__c";
import PAYOUT_FREQ_FIELD from "@salesforce/schema/FD_Details__c.Payout_Frequency__c";

// import apex classes
import fetchCustomerType from '@salesforce/apex/fetchScheme.fetchCustomerType';
import fetchInterestScheme from '@salesforce/apex/fetchScheme.fetchInterestScheme';
import updateFD from '@salesforce/apex/fetchScheme.updateFD';


export default class SelectScheme extends LightningElement {

// shift + alt +down arrow on you keyboard after you highlight the part u will copy

// decorators
//api , wire, track
//api -> make our properties public 
//wire -> is to use apex method or to get salesforce data //-> imperative apex
//track -> is used to make it(objects , arrays) reactive 
//properties are reactive by default

@api recordId;//-> this code gives me the record id autoomatically in js
// since i have in my meta file record page target

//@wire -> @AuraEnabled
customerTypeOptions=[];
customerTypeValue;

depositTypeOptions=[];
depositTypeValue;

payoutFrequencyOptions=[];
payoutFrequencyValue;
payFreqData;


// tenorInMonthsOptions=[];
tenorInMonthsValue;
tenorInDaysValue;

fdAmountValue;

interestSchemeValue;
schemeOptions=[];

interestRateValue;

//on saturday continue from this part
@wire(fetchCustomerType, {fdId :'$recordId'}) 
custTypeData({data,error}){
    if(data){
        console.log(data);
        console.log(`id of the record: ${JSON.stringify(data.Id)}`)//
        console.log('name of the record: '+JSON.stringify(data.Name));//traditional way
        let options=[];
        options.push({
            label:data.Customer_Type__c,
            value:data.Customer_Type__c
        });
        this.customerTypeOptions=options;


    }else if(error){
        console.log(error);
    }
}



    customerTypeHandler(event){
        this.customerTypeValue=event.detail.value
        console.log(`The chosen Customer Type Value is : ${this.customerTypeValue}`)
    }



    //////////////////////          DEPOSIT TYPE FIELD  ////////////////////


    @wire(getObjectInfo, { objectApiName: FD_DETAILS_OBJECT })
    fdDetailsData;
    // fdDetailsData({data, error}){
    //     if(data){
    //         console.log(data);
    //         console.log(`deposit type : ${JSON.stringify(data.DepositType__c)}`)
    //         console.log(`default record type id is: ${JSON.stringify(data.defaultRecordTypeId)}`)
    //     }else if(error){
    //         console.log(error);
    //     }
    // }




    @wire(getPicklistValues, { recordTypeId: "$fdDetailsData.data.defaultRecordTypeId", fieldApiName: DEPOSIT_TYPE_FIELD })
  depositTypeData({data,error}){
    if(data){
        console.log(data);
        let options=[];
        data.values.forEach(e=>{
            options.push({
                label:e.label,
                value:e.value
            })
            console.log(`e.label: ${e.label}`)
            console.log(`e.value: ${e.value}`)
        })
this.depositTypeOptions=options;
    }else if(error){
        console.log(error);
    }
  }

  depositTypeHandler(event){
    this.depositTypeValue=event.target.value;
    console.log(`the chosen value is :  ${this.depositTypeValue}`)

    let key=this.payFreqData.controllerValues[event.target.value];
    this.payoutFrequencyOptions=this.payFreqData.values.filter(e=>e.validFor.includes(key))
    //filter method

  }

  //////////////////           Payout Frequency Field   //////////////


  @wire(getPicklistValues ,{recordTypeId:'$fdDetailsData.data.defaultRecordTypeId' , fieldApiName:PAYOUT_FREQ_FIELD}) 
  payoutFreqData({data, error}){
    if(data){
        console.log(data);
        this.payFreqData=data;
//         let options=[];
//         data.values.forEach(e=>{
//             options.push({
//                 label:e.label,
//                 value:e.value
//             })
//             console.log(`e.label: ${e.label}`)
//             console.log(`e.value: ${e.value}`)
//         })
// this.payoutFrequencyOptions=options;
    }else if(error){
        console.log(error)
    }
  }


  payoutFrequencyHandler(event){
    this.payoutFrequencyValue=event.target.value;
    console.log(`the payout frequency you have chosen is : ${this.payoutFrequencyValue}`)
  }



  ////////////////////      Tenor In Months   ////////////////

//getter methods come/ run when they are called
//and they return a value

get tenorInMonthsOptions(){
    let options=[];
    for(let i=1;i<13;i++){
        options.push({
            label:i.toString(),
            value:i.toString()
        })
    }
    return options;
}
tenorInMonthsHandler(event){
    this.tenorInMonthsValue=event.target.value;
    console.log(`the chosen tenor in months value is : ${this.tenorInMonthsValue}`);
}




  ////////////////////      Tenor In Days   ////////////////



get tenorInDaysOptions(){
    let options=[];
    for(let i=1;i<31;i++){
        options.push({
            label:i.toString(),
            value:i.toString()
        })
    }
    return options;
}
tenorInDaysHandler(event){
    this.tenorInDaysValue=event.target.value;
    console.log(`the chosen tenor in months value is : ${this.tenorInDaysValue}`);
}



fdAmountHandler(event){
    this.fdAmountValue=event.target.value;
    console.log(`the chosen value is : ${this.fdAmountValue}`);
}

fetchSchemeHandler(){
    let isValid=true;
    // querySelectorAll method will let you the get the data from 
    // html file. since we put the same  class for all 6 fields we will get
    // all of those fields data
    let inputFields=this.template.querySelectorAll('.clsFetchScheme');
    console.log(inputFields);
    inputFields.forEach(e=>{
        if(!e.checkValidity()){//we check if it is not valid
            e.reportValidity();
            isValid=false;
        }
    });
    // if you need to reach the apex method immmediately as soon as page is loaded 
    // you should use wire decorator.

    //if you need to reach that method when a button is clicked 
    //use imperaative apex
    if(isValid){
        fetchInterestScheme({
            custType:this.customerTypeValue,
            depType: this.depositTypeValue,
            tenMonths:this.tenorInMonthsValue,
            tenorDays:this.tenorInDaysValue,
            fdAmount:this.fdAmountValue,
            fdId:this.recordId
        })
            .then(result => {
                console.log(result);
                let options=[];
                result.forEach(eachScheme=>{
                    options.push({
                        label:eachScheme.Name,
                        value:eachScheme.Id,
                        interestRate:eachScheme.Interest_Rate__c
                    })


                })
                this.schemeOptions=options;
            })
            .catch(error => {
                console.log(error);
            });

    }



}
//ctrl +z -> to get back the step

interestSchemeHandler(event){
    var schemeRecId=event.target.value;
    for(var i=0;i<this.schemeOptions.length;i++){
        if(schemeRecId==this.schemeOptions[i].value){//we check if scheme value is the one user chosen
            this.interestSchemeValue=schemeRecId;
            this.interestRateValue=this.schemeOptions[i].interestRate;

        }

    }
}

handleSave(){
    // we check if the 6 fields which is above fetch button are valid
    let isValid=true;
    let inputFields=this.template.querySelectorAll('.clsFetchScheme');
    inputFields.forEach(e=>{
        if(!e.checkValidity()){
            e.reportValidity();
            isValid=false;

        }
    })

    // we check with below code if 2 fields
    // which is under fetch scheme button are valid
    isValid=true;
    inputFields=this.template.querySelectorAll('.clsSaveButton');
    inputFields.forEach(e=>{
        if(!e.checkValidity()){
            e.reportValidity();
            isValid=false;

        }
    })


// we use imperative apex cause it will be invoked when a button clicked
    if(isValid){
        updateFD({
            //left part (apex): right part (variables in js)
            depType:this.depositTypeValue,
            payFreq:this.payoutFrequencyValue,
            tenMonths:this.tenorInMonthsValue,
            tenDays:this.tenorInDaysValue,
            fdAmount:this.fdAmountValue,
            inScheme:this.interestSchemeValue,
            fdId:this.recordId,
            inRate:this.interestRateValue
        })
            .then(result => {
                console.log(result);
                this.dispatchEvent(new ShowToastEvent({
                    title: "Successsss!!!",
                    message: "The record is updated succesffully",
                    variant: "success"
                }));
            })
            .catch(error => {
                console.log(error);
            });
    }
}

}