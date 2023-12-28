public class FDDetailsTriggerHandler {

    
    //recapping subject
    
    
    //access modifier
    //private, public, protected, global
    // static - non static
    // 
    // void -> not returning anything
    // 
    
    
    
    //populate relationship officer field according to branch field
    // trigger.new(fdList) -> [record, record, record, ....]
    // (branch, ro, tenor, ......), (branch, ro, tenor, ......), (branch, ro, tenor, ......)
    public static void populateRO(list<FD_Details__c> fdList){
        set<string> branches=new set<string>();
        for(FD_Details__c fd:fdList){
            branches.add(fd.Branch__c);
        }
        
         //SECOND WAY (SUGGESTED WAY)--------------
        //map -> branch names as key, RO as value
        map<string, string> branchMap=new map<string, string>();
        //alaska -> tom
        //california -> jack
        list<Branch_Relationship_Officer__c> broList=[SELECT Id,Branch_Name__c, Relationship_Officer__c
                                                  FROM Branch_Relationship_Officer__c
                                                  WHERE Branch_Name__c=: branches ];
        for(Branch_Relationship_Officer__c bro :broList){
            branchMap.put(bro.Branch_Name__c,bro.Relationship_Officer__c);
          
        }
        for(FD_Details__c fd:fdList){
            if(string.isNotBlank(fd.Branch__c)){
                fd.Relationship_Officer__c=branchMap.get(fd.Branch__c);
            }
            
        }
           
           
         //FIRST WAY-------------- (not suggested)
        //Use SOQL query to find the relationship officer which assigned to that specific branch.
        //if branch field is not empty
        /*
        if(branches.size()>0){
            list<Branch_Relationship_Officer_c> bro=[SELECT Id, Branch_Namec, Relationship_Officer_c 
                                                  FROM Branch_Relationship_Officer__c
                                                   WHERE Branch_Name__c=: branches ];
            
             
        //there are nested loop > makes system tired
        
        for(FD_Details__c fd:fdList){
            for(Branch_Relationship_Officer__c br:bro){
                //if relationship officer field is not empty 
                if(String.isNotBlank(br.Relationship_Officer_c) && br.Relationship_Officer_c != null &&
                  br.Branch_Name_c==fd.Branch_c){
                    fd.Relationship_Officer_c=br.Relationship_Officer_c;
                }
            }
        }


		        
        }
        */
        
    }
     public static void shareROAfter(list<FD_Details__c> fdList){
        //INSERT 
        //for each ->new RO
        //I will share the record with the new RO  
        
        //UPDATE
        //for each ->new RO / old RO 
        //I will delete the sharing from old RO 
        //I will share the record with the new RO 
        
        List<FD_Details__Share> fdShareList = new  List<FD_Details__Share>();
        for(FD_Details__c fd:fdList){
            if(string.isNotBlank(fd.Relationship_Officer__c) && fd.Relationship_Officer__c!=fd.OwnerId){
                   FD_Details__Share fds=new FD_Details__Share(ParentId=fd.Id, 
                                                UserOrGroupId=fd.Relationship_Officer__c,
                                                AccessLevel='read',
                                                RowCause='Manual');
					fdShareList.add(fds);


            }
        }
           
     insert fdShareList;
    }
   public static void deleteSharingRO(list<FD_Details__c>fdList, map<id, FD_Details__c>fdOldMap){
        //soql 
        //trigger.oldmap
        //trigger.new
        //user was in the oldmap
        //rowcause manual
        //access level read
        //we have to check it is not the owner
       
        //= -> assignment 
        //== -> checking
        //!= -> checking
        list<FD_Details__Share> fdDeleteList=new list<FD_Details__Share>();
        for(FD_Details__c fd:fdList){
            if(string.isNotBlank(fd.Relationship_Officer__c) 
               && fd.Relationship_Officer__c!=fd.OwnerId 
               && fd.Relationship_Officer__c!=fdOldMap.get(fd.Id).Relationship_Officer__c){
                   fdDeleteList.add([SELECT Id, UserOrGroupId, ParentId, AccessLevel, RowCause 
         					FROM FD_Details__Share 
                            WHERE UserOrGroupId=:fdOldMap.get(fd.Id).Relationship_Officer__c
                           	AND ParentId=:fd.Id
                           	AND RowCause='Manual']);
        
               }
        }
        delete fdDeleteList;
        //fdOldMap.get(key)->value
        
   }  
      
   }