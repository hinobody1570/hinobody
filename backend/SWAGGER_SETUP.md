# Swagger API Documentation Setup

Swagger/OpenAPI documentation has been successfully integrated into the HiNobody backend.

## Access Swagger UI

Once the server is running, access the Swagger documentation at:

**http://localhost:3001/api**

## Features

- ✅ Complete API documentation
- ✅ JWT Bearer token authentication
- ✅ Interactive API testing
- ✅ Request/Response schemas
- ✅ API tags for organization
- ✅ Operation summaries and descriptions

## Authentication

To test protected endpoints:

1. Use the `/auth/register` or `/auth/login` endpoint to get a JWT token
2. Click the "Authorize" button in Swagger UI
3. Enter: `Bearer <your-jwt-token>`
4. Click "Authorize" and "Close"
5. Now you can test protected endpoints

## API Tags

- **auth** - Authentication endpoints
- **users** - User management
- **boards** - Board management
- **posts** - Post management
- **comments** - Comment management
- **votes** - Voting system
- **reports** - Reporting system
- **blocks** - User blocking
- **images** - Image management

## Next Steps

To add more Swagger documentation to other controllers, use:

```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('your-tag')
@ApiBearerAuth('JWT-auth')
@Controller('your-endpoint')
export class YourController {
  @Get()
  @ApiOperation({ summary: 'Your operation summary' })
  @ApiResponse({ status: 200, description: 'Success description' })
  yourMethod() {
    // ...
  }
}
```



