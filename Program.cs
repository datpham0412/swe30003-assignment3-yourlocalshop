using Assignment_3_SWE30003.Data;
using Assignment_3_SWE30003.Models;
using Assignment_3_SWE30003.Managers;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Configure JSON serialization to convert enums to strings for API responses
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure SQLite database connection
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=localshop.db"));

// Register EmailSender as singleton for application-wide email notifications
builder.Services.AddSingleton<EmailSender>();

// Register business logic services with scoped lifetime (per request)
builder.Services.AddScoped<Catalogue>();
builder.Services.AddScoped<Inventory>();
builder.Services.AddScoped<AccountManager>();

// Configure CORS to allow requests from frontend running on localhost:3000
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalFrontend", policy =>
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

var emailSender = app.Services.GetRequiredService<EmailSender>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Seed database with default admin account if it doesn't exist
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        context.Database.EnsureCreated();

        // Create default admin account
        var adminEmail = "admin@gmail.com";
        var existingAdmin = context.Accounts.FirstOrDefault(a => a.Email == adminEmail && a.Role == "Admin");
        if (existingAdmin == null)
        {
            var admin = new Account { Email = adminEmail, Password = "123456789", Role = "Admin", Name = "Admin" };
            context.Accounts.Add(admin);
            context.SaveChanges();
            Console.WriteLine($"Seed: Admin account '{adminEmail}' created.");
        }
        else
        {
            Console.WriteLine($"Seed: Admin account '{adminEmail}' already exists.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Error during seeding: {ex.Message}");
    }
}


app.UseHttpsRedirection();

app.UseCors("AllowLocalFrontend");

app.MapControllers();
app.Run();
