const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

describe('users', () => {
  beforeEach(() => {
    return setup(pool);
  });
  // Dummy user for testing
  const mockUser = {
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    password: '12345',
  };

  it('POST /api/v1/users creates a new user', async () => {
    const res = await request(app).post('/api/v1/users').send(mockUser);
    expect(res.status).toBe(200);
    const { firstName, lastName, email } = mockUser;

    expect(res.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email,
    });
  });

  it('POST /api/v1/sessions signs in an existing user', async () => {
    await request(app).post('/api/v1/users').send(mockUser);
    const res = await request(app)
      .post('/api/v1/users/sessions')
      .send({ email: 'test@example.com', password: '12345' });
    expect(res.status).toEqual(200);
  });

  it('GET api/v1/users/protected should return a 401 if not authenticated', async () => {
    const res = await request(app).get('/api/v1/users/protected');
    expect(res.status).toEqual(401);
  });

  it('api/v1/users/protected should return the current user if authenticated', async () => {
    const agent = request.agent(app);
    // create a User directly in the database (saves an API call)
    const user = await UserService.create({ ...mockUser });
    // sign in that user

    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'test@example.com', password: '12345' });
    const res = await agent.get('/api/v1/users/protected');
    expect(res.status).toEqual(200);
  });

  it('GET api/v1/users should return 401 if user not admin', async () => {
    const agent = request.agent(app);
    // create a User directly in the database (saves an API call)
    const user = await UserService.create({ ...mockUser });
    // sign in that user

    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'test@example.com', password: '12345' });

    const res = await agent.get('/api/v1/users/');
    expect(res.status).toEqual(403);
  });

  it('/users should return 200 if user is admin', async () => {
    const agent = request.agent(app);

    // create an admin user
    await agent.post('/api/v1/users').send({
      email: 'admin',
      password: '1234',
      firstName: 'admin',
      lastName: 'admin',
    });
    // sign in the admin
    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'admin', password: '1234' });

    // const [agent] = await registerAndLogin({ email: 'admin' });
    const res = await agent.get('/api/v1/users/');
    console.log(res.body);
    expect(res.status).toEqual(200);
  });

  it('DELETE /sessions deletes the user session', async () => {
    const agent = request.agent(app);
    // create a User directly in the database (saves an API call)
    const user = await UserService.create({ ...mockUser });
    // sign in that user
    await agent
      .post('/api/v1/users/sessions')
      .send({ email: 'test@example.com', password: '12345' });

    const resp = await agent.delete('/api/v1/users/sessions');
    expect(resp.status).toBe(204);
  });
  afterAll(() => {
    pool.end();
  });
});
