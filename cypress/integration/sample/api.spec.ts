// This is a sample file to remember how to call Epinio API with Cypress

describe('API testing', () => {
    it('Delete application via API', () => {
        cy.request({
            method: 'DELETE',
            timeout: 60000,
            url: 'https://epinio.'+ Cypress.env('system_domain') + '/api/v1/namespaces/workspace/applications/testapp',
            headers: {
                accept: 'application/json'
            },
            auth: {
                'user': 'admin',
                'pass': 'password',
            } 
        });
    })
});
