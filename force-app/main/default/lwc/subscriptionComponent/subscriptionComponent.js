import { LightningElement, track, wire,api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { CurrentPageReference } from 'lightning/navigation';
import createSubscription from '@salesforce/apex/SubscriptionService.createSubscription';
import fetchDefaultRecord from '@salesforce/apex/CustomLookupController.fetchDefaultRecord';
export default class SubscriptionComponent extends LightningElement {
    @track isFirstScreen = true;
    @track isSecondScreen = false;

    selectedItem;

    // Form Data
    @track accountName = '';
    @track productName = '';
    @track subscriptionType = '';
    @track tier = '';
    @track value = '';
    @track description = '';

    // Search Results
    @track accountResults = [];
    @track productResults = [];
    @track selectedAccountId = '';
    @track selectedProductId = '';
    
    @api recordId;
    pageRef;
    @wire(CurrentPageReference)
    wiredPageRef(pageRef) {
        if (pageRef) {
            this.pageRef = pageRef;
            this.handleAutoPopulate();  // Auto-populate only when pageRef is available
        }
    }


    handleAutoPopulate() {
        const recordId = this.recordId;
        const objectApiName = this.pageRef?.attributes?.objectApiName;
    
        console.log('recordId:', recordId);  
        console.log('objectApiName:', objectApiName); 

        if (objectApiName === 'Account' && recordId) {
            this.selectedAccountId = recordId;
            fetchDefaultRecord({ recordId: this.selectedAccountId, sObjectApiName: 'Account' })
                .then(result => {
                    if (result) {
                        this.accountName = result.Name;
                        this.template.querySelector('c-custom-lookup').lookupUpdatehandler(result);
                    }
                })
                .catch(error => {
                    console.error('Error fetching Account:', error);
                });
        }
    
        if (objectApiName === 'Product2' && recordId) {
            this.selectedProductId = recordId;
            fetchDefaultRecord({ recordId: this.selectedProductId, sObjectApiName: 'Product2' })
                .then(result => {
                    if (result) {
                        this.productName = result.Name;
                        this.template.querySelector('c-custom-lookup').lookupUpdatehandler(result);
                    }
                })
                .catch(error => {
                    console.error('Error fetching Product:', error);
                });
        }
    }
    

    connectedCallback() {
        // Check if the LWC is on a record page
        const recordId = this.recordId;
        const objectApiName = this.pageRef?.attributes?.objectApiName;
    
        console.log('recordId: '+recordId);
        // If on an account record page, automatically populate the Account lookup
        if (objectApiName === 'Account' && recordId) {
            this.selectedAccountId = recordId;
                fetchDefaultRecord({ recordId: this.selectedAccountId, sObjectApiName: 'Account' })
                .then(result => {
                    if (result) {
                        this.accountName = result.Name;
                    }
                })
                .catch(error => {
                    console.error('Error fetching Account:', error);
                });
        }
    
        if (objectApiName === 'Product2' && recordId) {
            this.selectedProductId = recordId;
                fetchDefaultRecord({ recordId: this.selectedProductId, sObjectApiName: 'Product2' })
                .then(result => {
                    if (result) {
                        this.productName = result.Name;
                    }
                })
                .catch(error => {
                    console.error('Error fetching Product:', error);
                });
        }
    }
    
    // Options for Combobox
    get subscriptionTypeOptions() {
        return [
            { label: 'Monthly', value: 'Monthly' },
            { label: 'Annual', value: 'Annual' },
            { label: 'Weekly', value: 'Weekly' }
        ];
    }

    get tierOptions() {
        return [
            { label: 'Bronze', value: 'Bronze' },
            { label: 'Silver', value: 'Silver' },
            { label: 'Gold', value: 'Gold' }
        ];
    }

    // Handle input changes
    handleInputChange(event) {
        this[event.target.name] = event.target.value;
    }

    // Handle account lookup with at least 3 characters
    handleAccountChange(event) {
        const searchKey = event.target.value;
        if (searchKey.length >= 3) {
            searchAccounts({ searchKey })
                .then(result => {
                    this.accountResults = result.map(account => ({
                        label: account.Name,
                        value: account.Id
                    }));
                })
                .catch(error => {
                    this.accountResults = [];
                    this.showToast('Error', 'Error finding account', 'error');
                });
        } else {
            this.accountResults = [];
        }
    }

    // Handle account selection from combobox
    handleAccountSelection(event) {
        this.selectedAccountId = event.detail.value;
        const selectedAccount = this.accountResults.find(account => account.value === this.selectedAccountId);
        this.accountName = selectedAccount ? selectedAccount.label : '';
    }

    // Handle product lookup with at least 3 characters
    handleProductChange(event) {
        const searchKey = event.target.value;
        if (searchKey.length >= 3) {
            searchProducts({ searchKey })
                .then(result => {
                    this.productResults = result.map(product => ({
                        label: product.Name,
                        value: product.Id
                    }));
                })
                .catch(error => {
                    this.productResults = [];
                    this.showToast('Error', 'Error finding product', 'error');
                });
        } else {
            this.productResults = [];
        }
    }

    // Handle product selection from combobox
    handleProductSelection(event) {
        this.selectedProductId = event.detail.value;
        const selectedProduct = this.productResults.find(product => product.value === this.selectedProductId);
        this.productName = selectedProduct ? selectedProduct.label : '';
    }

    // Transition to next screen
    handleNext() {
        // Check if account and product are selected
        if (!this.accountName || !this.selectedAccountId) {
            this.showToast('Error', 'Please select an Account before proceeding', 'error');
            return;
        }
        
        if (!this.productName || !this.selectedProductId) {
            this.showToast('Error', 'Please select a Product before proceeding', 'error');
            return;
        }
    
        // Transition to the second screen
        this.isFirstScreen = false;
        this.isSecondScreen = true;
    }

    // Transition to previous screen
    handleBack() {
        this.isFirstScreen = true;
        this.isSecondScreen = false;
    }

    // Handle submit action
    handleSubmit() {
        const fields = {
            accountId: this.selectedAccountId,
            productId: this.selectedProductId,
            subscriptionType: this.subscriptionType,
            tier: this.tier,
            value: this.value,
            description: this.description
        };
        createSubscription({ subscriptionData: fields })
            .then(() => {
                this.showToast('Success', 'Subscription created successfully', 'success');
                // Reset form after submission
                this.isFirstScreen = true;
                this.isSecondScreen = false;
                this.resetForm();
            })
            .catch(error => {
                this.showToast('Duplicate subscription found for this customer-product-tier combination.');
            });
    }

    // Utility for showing toast notifications
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }

    lookupRecord(event) {
        const selectedRecord = event.detail.selectedRecord;
        const lookupType = event.target.getAttribute('data-type');  // Get the type of lookup (Account or Product)
        
        if (selectedRecord && selectedRecord.Name && selectedRecord.Id) {
            if (lookupType === 'account') {
                // Save the Account name and ID
                this.accountName = selectedRecord.Name;
                this.selectedAccountId = selectedRecord.Id;
            } else if (lookupType === 'product') {
                // Save the Product name and ID
                this.productName = selectedRecord.Name;
                this.selectedProductId = selectedRecord.Id;
            }
        } else {
            console.error('Invalid selected record received:', selectedRecord);
        }
    }
    handleAccountChange() {
        this.selectedItem = 'account';  // Track which lookup is being used
    }
    handleProductChange() {
        this.selectedItem = 'product';  // Track which lookup is being used
    }

    // Reset form data
    resetForm() {
        this.accountName = '';
        this.productName = '';
        this.subscriptionType = '';
        this.tier = '';
        this.value = '';
        this.description = '';
        this.accountResults = [];
        this.productResults = [];
        this.selectedAccountId = '';
        this.selectedProductId = '';
    }
}
