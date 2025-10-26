using Assignment_3_SWE30003.Data;
using Assignment_3_SWE30003.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Configure JSON serialization to use string enums globally
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=localshop.db"));

// Register Catalogue as a scoped service (one instance per request)
builder.Services.AddScoped<Catalogue>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalFrontend", policy =>
        policy.WithOrigins("http://localhost:3000") 
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// --- Startup seeding: ensure an admin account exists ---
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        // Ensure database is created (migrations are used in repo but ensure created as a safety)
        context.Database.EnsureCreated();

        // Check if admin exists
        var adminEmail = "admin@gmail.com";
        var existingAdmin = context.Accounts.FirstOrDefault(a => a.Email == adminEmail && a.Role == "Admin");
        if (existingAdmin == null)
        {
            // Create admin account with provided password
            var admin = new Assignment_3_SWE30003.Models.Account { Email = adminEmail, Password = "123456789", Role = "Admin", Name = "Admin" };
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
