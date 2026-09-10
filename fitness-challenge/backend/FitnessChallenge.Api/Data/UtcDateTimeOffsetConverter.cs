using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace FitnessChallenge.Api.Data;

// The Sqlite provider throws NotSupportedException on ORDER BY / comparisons over
// DateTimeOffset columns (ambiguous offset semantics). We only ever store UTC, so
// round-tripping through DateTime is lossless and lets Sqlite compare/order server-side.
public class UtcDateTimeOffsetConverter : ValueConverter<DateTimeOffset, DateTime>
{
    public UtcDateTimeOffsetConverter()
        : base(
            v => v.UtcDateTime,
            v => new DateTimeOffset(DateTime.SpecifyKind(v, DateTimeKind.Utc)))
    {
    }
}
