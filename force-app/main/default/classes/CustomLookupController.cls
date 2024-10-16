public with sharing class CustomLookupController {
    // Method to fetch lookup search result
    @AuraEnabled(cacheable=true)
    public static list<sObject> fetchLookupData(string searchKey, string sObjectApiName) {
        List<sObject> returnList = new List<sObject>();
        string sWildCardText = '%' + searchKey + '%';
        string sQuery =
            'Select Id,Name From ' +
            sObjectApiName +
            ' Where Name Like : sWildCardText order by createdDate DESC LIMIT 5';
        for (sObject obj : database.query(sQuery)) {
            returnList.add(obj);
        }
        return returnList;
    }

    // Method to fetch lookup default value
    @AuraEnabled(cacheable=true)
    public static sObject fetchDefaultRecord(string recordId, string sObjectApiName) {

        String query = 'SELECT Id, Name FROM ' + sObjectApiName + ' WHERE Id = :recordId LIMIT 1';
        List<sObject> results = Database.query(query);
        if (!results.isEmpty()) {
            return results[0];
        }
        return null;        
/** 
        string sRecId = recordId;
        string sQuery = 'Select Id,Name From ' + sObjectApiName + ' Where Id = : sRecId LIMIT 1';
        for (sObject obj : database.query(sQuery)) {
            return obj;
        }
        return null;*/
    }
}