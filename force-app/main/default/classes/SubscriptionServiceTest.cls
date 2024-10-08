@IsTest
public class SubscriptionServiceTest {
    @TestSetup
    static void setupTestData() {
        // Create test Account
        Account testAccount = new Account(Name = 'Test Account');
        insert testAccount;

        // Create test Product
        Product2 testProduct = new Product2(Name = 'Test Product');
        insert testProduct;

        // Create an existing Subscription to test duplicate check
        Subscription__c testSubscription = new Subscription__c(
            Account__c = testAccount.Id,
            Product__c = testProduct.Id,
            Subscription_Type__c = 'Monthly',
            Tier__c = 'Silver',
            Value__c = 100
        );
        insert testSubscription;
    }

    @IsTest
    static void testCreateSubscription() {
        // Retrieve test Account and Product
        Account acc = [SELECT Id FROM Account LIMIT 1];
        Product2 prod = [SELECT Id FROM Product2 LIMIT 1];

        // Create new subscription data
        Map<String, String> subscriptionData = new Map<String, String>{
            'accountId' => acc.Id,
            'productId' => prod.Id,
            'subscriptionType' => 'Monthly',
            'tier' => 'Silver',
            'value' => '100',
            'description' => 'Test Description'
        };

        // Test creating a subscription
        Test.startTest();
        SubscriptionService.createSubscription(subscriptionData);
        Test.stopTest();
    }

    @IsTest
    static void testCreateNonDuplicateSubscription() {
        // Create a different subscription to avoid duplicate conflict
        Account acc = [SELECT Id FROM Account LIMIT 1];
        Product2 prod = [SELECT Id FROM Product2 LIMIT 1];

        Map<String, String> subscriptionData = new Map<String, String>{
            'accountId' => acc.Id,
            'productId' => prod.Id,
            'subscriptionType' => 'Annual',
            'tier' => 'Gold',
            'value' => '200',
            'description' => 'New Subscription'
        };

        Test.startTest();
        SubscriptionService.createSubscription(subscriptionData);
        Test.stopTest();

        // Verify new subscription is created
        Subscription__c createdSub = [SELECT Id FROM Subscription__c WHERE Account__c = :acc.Id AND Product__c = :prod.Id AND Subscription_Type__c = 'Annual'];
        System.assertNotEquals(null, createdSub, 'Subscription should be created');
    }
}