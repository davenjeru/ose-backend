import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Health Query (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should return healthy status when database is connected', async () => {
    // Mock the database connection to return true
    jest.spyOn(prismaService, 'isConnected').mockResolvedValue(true);

    const query = `
      query {
        health {
          status
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);

    expect(response.body.data.health).toEqual({
      status: 'healthy'
    });
  });

  it('should return unhealthy status when database is not connected', async () => {
    // Mock the database connection to return false
    jest.spyOn(prismaService, 'isConnected').mockResolvedValue(false);

    const query = `
      query {
        health {
          status
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);

    expect(response.body.data.health).toEqual({
      status: 'unhealthy'
    });
  });

  it('should return unhealthy status when database connection throws error', async () => {
    // Mock the database connection to throw an error
    jest.spyOn(prismaService, 'isConnected').mockRejectedValue(new Error('Database error'));

    const query = `
      query {
        health {
          status
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({ query })
      .expect(200);

    expect(response.body.data.health).toEqual({
      status: 'unhealthy'
    });
  });
});

