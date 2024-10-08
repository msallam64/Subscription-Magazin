@IsTest
public class CustomLookupControllerTest {
    @TestSetup
    static void setupTestData() {
        // Create test Accounts and Products
        Account testAccount1 = new Account(Name = 'Test Account 1');
        Account testAccount2 = new Account(Name = 'Test Account 2');
        insert new List<Account>{testAccount1, testAccount2};

        Product2 testProduct1 = new Product2(Name = 'Test Product 1');
        Product2 testProduct2 = new Product2(Name = 'Test Product 2');
        insert new List<Product2>{testProduct1, testProduct2};
    }

    @IsTest
    static void testFetchLookupData() {
        // Fetch lookup data with search key
        Test.startTest();
        List<SObject> result = CustomLookupController.fetchLookupData('Test', 'Account');
        Test.stopTest();

        System.assert(result.size() == 2, 'Two accounts should be returned');
        System.assert(((Account)result[0]).Name.contains('Test'), 'First account should have "Test" in name');
    }

    @IsTest
    static void testFetchDefaultRecord() {
        // Fetch default record by Id
        Account acc = [SELECT Id, Name FROM Account LIMIT 1];

        Test.startTest();
        SObject result = CustomLookupController.fetchDefaultRecord(acc.Id, 'Account');
        Test.stopTest();

        System.assert(result != null, 'Account record should be returned');
        System.assertEquals(acc.Name, ((Account)result).Name, 'Returned account should match the inserted one');
    }
}
