using System;
using System.Runtime.InteropServices;

public static class NativeMethods
{
    [DllImport(@"C:\Users\SINAGOGA\source\repos\field_calculation\x64\Release\field_calculation.dll", CallingConvention = CallingConvention.Cdecl)]
    public static extern void CalculateFields(
        double frequency,
        double skinThickness,
        double fatThickness,
        double muscleThickness,
        out double E1_real,
        out double E1_imag,
        out double E2_real,
        out double E2_imag,
        out double E3_real,
        out double E3_imag,
        out double SAR_skin,     
        out double SAR_fat,    
        out double SAR_muscle   
    );
}