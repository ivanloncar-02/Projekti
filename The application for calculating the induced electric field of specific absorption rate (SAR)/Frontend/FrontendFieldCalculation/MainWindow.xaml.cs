using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Controls;
using LiveChartsCore;
using LiveChartsCore.SkiaSharpView;
using LiveChartsCore.SkiaSharpView.Painting;
using SkiaSharp;

namespace FrontendFieldCalculation
{
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private void CalculateButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (double.TryParse(FrequencyTextBox.Text, out double frequencyInGHz) &&
                    double.TryParse(SkinThicknessTextBox.Text, out double skinThickness) &&
                    double.TryParse(FatThicknessTextBox.Text, out double fatThickness) &&
                    double.TryParse(MuscleThicknessTextBox.Text, out double muscleThickness))
                {
                    // Convert frequency from GHz to Hz
                    double frequency = frequencyInGHz * 1e9;

                    // Call the DLL function with the input values to get electric field and SAR values
                    NativeMethods.CalculateFields(frequency, skinThickness, fatThickness, muscleThickness,
                        out double E1_real, out double E1_imag, 
                        out double E2_real, out double E2_imag, 
                        out double E3_real, out double E3_imag,
                        out double SAR_skin, out double SAR_fat, out double SAR_muscle);  // SAR outputs

                    // Display the electric field results
                    ResultTextBlock.Text = $"E1: {E1_real} + {E1_imag}i \nE2: {E2_real} + {E2_imag}i \nE3: {E3_real} + {E3_imag}i";
                    
                    // Display the SAR results
                    SARResultTextBlock.Text = $"SAR (Skin): {SAR_skin:F6} W/kg \nSAR (Fat): {SAR_fat:F6} W/kg \nSAR (Muscle): {SAR_muscle:F6} W/kg";

                    // Calculate the magnitude of the electric field in each layer
                    double E1_magnitude = CalculateMagnitude(E1_real, E1_imag);
                    double E2_magnitude = CalculateMagnitude(E2_real, E2_imag);
                    double E3_magnitude = CalculateMagnitude(E3_real, E3_imag);

                    // Simulate the decline of electric field through layers
                    List<double> positions = new List<double>();
                    List<double> electricFieldValues = new List<double>();

                    // Skin layer (0 to skinThickness)
                    for (double x = 0; x <= skinThickness; x += skinThickness / 10)
                    {
                        positions.Add(x);
                        electricFieldValues.Add(CalculateElectricField(E1_magnitude, x / skinThickness));
                    }

                    // Fat layer (skinThickness to skinThickness + fatThickness)
                    for (double x = skinThickness; x <= skinThickness + fatThickness; x += fatThickness / 10)
                    {
                        positions.Add(x);
                        electricFieldValues.Add(CalculateElectricField(E2_magnitude, (x - skinThickness) / fatThickness));
                    }

                    // Muscle layer (skinThickness + fatThickness to skinThickness + fatThickness + muscleThickness)
                    for (double x = skinThickness + fatThickness; x <= skinThickness + fatThickness + muscleThickness; x += muscleThickness / 10)
                    {
                        positions.Add(x);
                        electricFieldValues.Add(CalculateElectricField(E3_magnitude, (x - skinThickness - fatThickness) / muscleThickness));
                    }

                    // Create a LineSeries to show the decline of electric field through layers
                    var lineSeries = new LineSeries<double>
                    {
                        Values = electricFieldValues,
                        LineSmoothness = 0, // straight lines
                        Fill = null,
                        Stroke = new SolidColorPaint(SKColors.Blue),
                        GeometryStroke = new SolidColorPaint(SKColors.Red),
                        GeometrySize = 5
                    };

                    // Configure the chart
                    FieldChart.Series = new ISeries[] { lineSeries };

                    FieldChart.XAxes = new Axis[]
                    {
                        new Axis
                        {
                            Name = "Position (m)",
                            Labels = positions.ConvertAll(p => p.ToString("F3")).ToArray()
                        }
                    };

                    FieldChart.YAxes = new Axis[]
                    {
                        new Axis
                        {
                            Name = "Electric Field (V/m)"
                        }
                    };
                }
                else
                {
                    MessageBox.Show("Please enter valid numerical values for all fields.", "Input Error", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"An error occurred: {ex.Message}", "Error", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        // Function to calculate the magnitude of the electric field
        private double CalculateMagnitude(double real, double imag)
        {
            return Math.Sqrt(Math.Pow(real, 2) + Math.Pow(imag, 2));
        }

        // Function to simulate electric field decline (can be modified for real calculations)
        private double CalculateElectricField(double initialValue, double normalizedPosition)
        {
            // Example: Exponential decay, this can be replaced with the actual model
            return initialValue * Math.Exp(-normalizedPosition);
        }
    }
}
