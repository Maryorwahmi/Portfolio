namespace Platform.Api.Services;

public class JwtOptions
{
    public string Issuer { get; set; } = "platform-api";
    public string Audience { get; set; } = "platform-client";
    public string SigningKey { get; set; } = "ChangeThisDevelopmentSigningKey_32CharsMin";
    public int ExpirationMinutes { get; set; } = 120;
}
