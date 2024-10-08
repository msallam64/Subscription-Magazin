public with sharing class SubscriptionService {
    @AuraEnabled
    public static void createSubscription(Map<String, String> subscriptionData) {
        Subscription__c sub = new Subscription__c();
        sub.Account__c = subscriptionData.get('accountId');
        sub.Product__c = subscriptionData.get('productId');
        sub.Subscription_Type__c = subscriptionData.get('subscriptionType');
        sub.Tier__c = subscriptionData.get('tier');
        sub.Value__c = Decimal.valueOf(subscriptionData.get('value'));
        sub.Description__c = subscriptionData.get('description');

        // Perform duplicate check here
        List<Subscription__c> duplicates = [
            SELECT Id FROM Subscription__c
            WHERE Account__c = :sub.Account__c
            AND Product__c = :sub.Product__c
            AND Tier__c = :sub.Tier__c
        ];
        if (!duplicates.isEmpty()) {
            throw new AuraHandledException('Duplicate subscription found for this customer-product-tier combination.');
        }

        insert sub;
    }
}
