trigger FDDetailsTrigger on FD_Details__c (before insert, before update,after insert, after update) {
    
    
    //before update , before insert
    //I will create a list 
    //static- non static 
    
 
    if(trigger.isBefore && (trigger.isInsert || trigger.isUpdate)){
        
        FDDetailsTriggerHandler.populateRO(trigger.new);
    
    }
   
     /*  if(trigger.isBefore){
        if(trigger.isInsert){
             FDDetailsTriggerHandler.methodName(trigger.new);
        }else if(trigger.isUpdate){
             FDDetailsTriggerHandler.methodName(trigger.new);
        }

    }
    */
    //after insert
    //after update -> it will also necessary to delete the previous sharing object record.
    //trigger.new, trigger.oldMap
    
    if(trigger.isAfter){
        if(trigger.isInsert){
            FDDetailsTriggerHandler.shareROAfter(trigger.new);
        }else if(trigger.isUpdate){
             FDDetailsTriggerHandler.shareROAfter(trigger.new);
             FDDetailsTriggerHandler.deleteSharingRO(trigger.new,trigger.oldMap);
        }
    }
    

}