@isTest
public class SubscriptionServiceTest {
    @isTest
    public static void testCreateSubscription() {
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        Product2 testProduct = new Product2(Name = 'Test Product');
        insert testProduct;

        Map<String, String> subscriptionData = new Map<String, String>{
            'accountName' => testAccount.Id,
            'productName' => testProduct.Id,
            'subscriptionType' => 'Monthly',
            'tier' => 'Bronze',
            'value' => '99.99',
            'description' => 'Test Subscription'
        };

        Test.startTest();
        SubscriptionService.createSubscription(subscriptionData);
        Test.stopTest();

        // Assert subscription was created
        Subscription__c sub = [SELECT Id FROM Subscription__c WHERE Account__c = :testAccount.Id];
        System.assertNotEquals(null, sub);
    }
}
