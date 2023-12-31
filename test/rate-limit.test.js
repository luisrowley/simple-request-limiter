const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../rateLimitService');

const { expect } = chai;
chai.use(chaiHttp);

describe('Rate Limit Service', () => {
    it('should respond with remaining tokens and allowed status', (done) => {
        const routeTemplate = 'GET /user/:id';
        chai.request(app)
            .post('/take')
            .send({ routeTemplate })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('remainingTokens').to.equal(9); 
                expect(res.body).to.have.property('allowed');
                done();
            });
    });
    
    it('should reject requests after rate limit is exceeded', (done) => {
        const routeTemplate = 'GET /user/:id';
        const requests = Array.from({ length: 11 }, (_, index) => index + 1);
        const promises = requests.map(() => {
            return chai.request(app)
                .post('/take')
                .send({ routeTemplate });
        });

        // remaining tokens: 9
        Promise.all(promises)
            .then((responses) => {
                for (let i = 0; i < 9; i++) {
                    expect(responses[i]).to.have.status(200);
                    expect(responses[i].body).to.have.property('remainingTokens').to.be.a('number');
                    expect(responses[i].body).to.have.property('allowed').to.be.true;
                }
                // remaining tokens: 0
                expect(responses[10]).to.have.status(200);
                expect(responses[10].body).to.have.property('remainingTokens').to.equal(0);
                expect(responses[10].body).to.have.property('allowed').to.be.false;
                done();
            })
            .catch((error) => done(error));
    });


    it('should handle missing route template and respond with 400', (done) => {
        chai.request(app)
            .post('/take')
            .end((err, res) => {
                expect(res).to.have.status(400);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('error');
                done();
            });
    });
});