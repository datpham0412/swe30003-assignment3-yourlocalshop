# Introduction

# Development

Guide for developers of the system

## Frontend (Next.js)

1. Install Node.js (https://nodejs.org/) if not already have installed

2. Go to `frontend` folder

```
cd frontend
```

3. Install frontend dependency

```
npm install
```

4. Start the website

```
npm run dev
```

### Other commands

Check eslint

```
npm run lint
```

## Backend (Dotnet)

1. (Optional if you have not had launchSettings) Create launchSettings in `Properties` folder
```
{
  "profiles": {
    "Assignment_3_SWE30003": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "applicationUrl": "http://localhost:5074",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

2. Run backend

```
dotnet run
```

or

```
dotnet run --launch-profile Assignment_3_SWE30003
```

3. Sync migrations when pulling new commits

### Other commands

Sync migrations

```
dotnet ef database update
```

Add new migration

```
dotnet ef migrations add <MigrationName>
```