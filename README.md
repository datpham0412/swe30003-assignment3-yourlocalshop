# Introduction

# Installation and User Manual

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

1. (Optional) Create launchSettings in `Properties` folder

2. Run backend

```
dotnet run
```

or

```
dotnet run --launch-profile <profile-name>
```

3. Sync migrations when pulling new commits

### Other commands

Sync migrations

```
dotnet ef database update
```
