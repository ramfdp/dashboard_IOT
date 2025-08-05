# Advanced Electricity Usage Prediction System

## Overview

This document describes the enhanced electricity usage calculation and prediction system implemented for the IoT Dashboard project. The system has been significantly improved with advanced algorithms, better user interface, and comprehensive analysis capabilities.

## Key Improvements

### 1. **Multiple Prediction Algorithms**

#### Original System:

- Simple quadratic regression
- Basic average calculations
- Limited accuracy

#### Enhanced System:

- **Linear Regression with Seasonal Adjustment**: Advanced linear regression that considers hourly, daily, and seasonal patterns
- **Moving Average with Trend Analysis**: Trend-adjusted moving average for stable predictions
- **Exponential Smoothing**: Time-series analysis for smooth predictions
- **Ensemble Method**: Combines multiple algorithms for best accuracy

### 2. **Advanced Analysis Features**

#### Statistical Analysis:

- **R² (Coefficient of Determination)**: Measures prediction accuracy
- **Coefficient of Variation**: Indicates data stability
- **Load Factor**: Shows system utilization efficiency
- **Demand Factor**: Analyzes peak demand patterns

#### Load Pattern Recognition:

- **Business Hours vs Off-Hours**: Automatic pattern detection
- **Weekend vs Weekday**: Different consumption patterns
- **Hourly Load Curves**: 24-hour consumption profiles
- **Seasonal Variations**: Monthly and seasonal adjustments

### 3. **Smart Recommendations**

The system now provides actionable recommendations:

- **Energy Efficiency Optimization**
- **Peak Hour Load Management**
- **Cost Reduction Strategies**
- **Equipment Utilization Improvements**

### 4. **Enhanced User Interface**

#### Modal Improvements:

- **Larger Modal**: Better visibility with `modal-lg` class
- **Multiple Tabs**: Organized information display
- **Real-time Confidence**: Live prediction confidence indicators
- **Interactive Charts**: Enhanced visualization

#### New UI Elements:

- **Confidence Gauge**: Visual representation of prediction reliability
- **Efficiency Metrics Cards**: Quick efficiency overview
- **Recommendation Cards**: Color-coded priority system
- **Algorithm Selection**: User can choose prediction method

## API Endpoints

### New REST API Routes:

```php
// Advanced electricity analysis endpoints
GET /api/electricity/analysis          // Comprehensive usage analysis
GET /api/electricity/predictions       // Smart predictions
GET /api/electricity/efficiency        // Efficiency metrics
GET /api/electricity/load-patterns     // Load pattern analysis
GET /api/electricity/recommendations   // Smart recommendations
GET /api/electricity/compare-algorithms // Algorithm comparison
GET /api/electricity/export-report     // Export analysis reports
```

### Example API Usage:

```javascript
// Get 24-hour predictions using linear regression
fetch("/api/electricity/predictions?hours_ahead=24&algorithm=linear_regression")
  .then((response) => response.json())
  .then((data) => {
    console.log("Predictions:", data.predictions);
    console.log("Accuracy:", data.algorithm.accuracy_level);
  });

// Get efficiency analysis
fetch("/api/electricity/efficiency?period=week")
  .then((response) => response.json())
  .then((data) => {
    console.log("Load Factor:", data.efficiency_metrics.load_factor);
    console.log("Stability:", data.efficiency_metrics.stability_rating);
  });
```

## Algorithm Details

### 1. Linear Regression with Seasonal Adjustment

**Purpose**: Provides accurate predictions by considering time-based patterns

**Features**:

- Calculates slope and intercept for trend analysis
- Applies hourly load factors (business hours have higher consumption)
- Includes daily factors (weekdays vs weekends)
- Seasonal adjustments for monthly variations
- Confidence calculation based on R² and time horizon

**Formula**:

```
Predicted_Power = (slope × time + intercept) × hourly_factor × daily_factor × seasonal_factor
```

**Accuracy**: R² typically > 0.8 for stable industrial loads

### 2. Ensemble Prediction

**Purpose**: Combines multiple algorithms for best overall accuracy

**Method**:

- Runs linear regression, moving average, and exponential smoothing
- Weights predictions based on individual algorithm confidence
- Provides ensemble confidence score
- Fallback mechanisms for failed algorithms

**Advantages**:

- More robust than single algorithms
- Self-correcting when one algorithm fails
- Higher overall accuracy

### 3. Load Pattern Recognition

**Business Hour Patterns**:

```javascript
// Typical industrial load factors by hour
hourlyPatterns = [
  0.3,
  0.25,
  0.2,
  0.2,
  0.25,
  0.4, // 00-05 (night)
  0.6,
  0.8,
  0.95,
  1.0,
  0.95,
  0.9, // 06-11 (morning peak)
  0.85,
  0.9,
  1.0,
  0.95,
  0.9,
  0.8, // 12-17 (afternoon peak)
  0.6,
  0.4,
  0.35,
  0.3,
  0.28,
  0.25, // 18-23 (evening)
];
```

**Weekly Patterns**:

- Monday-Friday: Full load (factor = 1.0)
- Saturday: Reduced load (factor = 0.4)
- Sunday: Minimal load (factor = 0.3)

## Configuration

### Frontend Configuration:

```javascript
// ElectricityCalculator configuration
config = {
  minDataPoints: 5,           // Minimum data for predictions
  maxPredictionHours: 72,     // Maximum prediction horizon
  confidenceThreshold: 0.7,   // Minimum confidence level
  seasonalFactors: [...],     // Monthly adjustment factors
  loadPatterns: [...]         // Hourly load patterns
}
```

### Backend Configuration:

```php
// ElectricityPredictionService configuration
private $minDataPoints = 7;     // Minimum data points for analysis
private $maxDataPoints = 168;   // Maximum hours for analysis (1 week)
```

## Performance Improvements

### Speed Optimizations:

- **Efficient Database Queries**: Optimized data retrieval with proper indexing
- **Caching**: Algorithm results cached for repeated requests
- **Lazy Loading**: Chart data loaded on demand
- **Parallel Processing**: Multiple algorithms run simultaneously

### Accuracy Improvements:

- **Data Quality Assessment**: Validates input data consistency
- **Outlier Detection**: Identifies and handles anomalous readings
- **Missing Data Handling**: Interpolation for missing values
- **Confidence Scoring**: Dynamic confidence based on data quality

## Installation & Setup

### 1. Backend Setup:

```bash
# Add the service to your Laravel app
# The ElectricityPredictionService is automatically registered

# Run database migrations if needed
php artisan migrate

# Clear cache
php artisan cache:clear
php artisan view:clear
```

### 2. Frontend Setup:

```html
<!-- Include the advanced calculator -->
<script src="/assets/js/advanced-electricity-calculator.js"></script>
<link href="/assets/css/advanced-electricity-calculator.css" rel="stylesheet" />
```

### 3. Usage in Blade Templates:

```blade
<!-- Chart canvas with data attributes -->
<canvas id="wattChart"
        data-labels='@json($dataKwh->pluck("waktu")->toArray())'
        data-values='@json($dataKwh->pluck("daya")->toArray())'
        width="1450" height="300">
</canvas>

<!-- The calculator will auto-initialize -->
<script>
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('wattChart');
    if (canvas) {
        window.electricityCalculator = new ElectricityCalculator(canvas);
    }
});
</script>
```

## Benefits of Linear Regression for Electricity Prediction

### Why Linear Regression is Good for Electricity Usage:

1. **Trend Identification**: Excellent at identifying long-term consumption trends
2. **Interpretability**: Results are easy to understand and explain
3. **Fast Computation**: Real-time predictions possible
4. **Stable Predictions**: Less prone to overfitting than complex models
5. **Seasonal Adjustment**: Can be enhanced with time-based factors

### When Linear Regression Works Best:

- **Industrial Facilities**: Consistent operating schedules
- **Office Buildings**: Predictable business hour patterns
- **Steady Loads**: Minimal sudden changes in consumption
- **Adequate Data**: At least 1 week of hourly readings

### Limitations & Alternatives:

**Limitations**:

- May struggle with highly irregular patterns
- Assumes linear relationships
- Less effective for very short-term predictions (< 1 hour)

**Alternative Algorithms Available**:

- **ARIMA**: For complex time series patterns
- **Neural Networks**: For non-linear relationships
- **Random Forest**: For capturing complex interactions
- **LSTM**: For long-term dependencies

## Example Results

### Sample Prediction Output:

```json
{
  "algorithm": "Advanced Linear Regression with Seasonal Adjustment",
  "coefficients": {
    "slope": 0.0234,
    "intercept": 87.45
  },
  "statistics": {
    "r_squared": 0.8567,
    "accuracy_level": "Very Good",
    "data_quality": 0.92
  },
  "predictions": [
    {
      "hour": 1,
      "predicted_power": 89.23,
      "predicted_energy": 0.089,
      "confidence": 0.85,
      "reliability": "High"
    }
  ],
  "summary": {
    "next_hour_power": 89.23,
    "next_24h_energy": 2.14,
    "average_confidence": 0.82,
    "trend_direction": "increasing",
    "trend_strength": "Weak"
  }
}
```

## Troubleshooting

### Common Issues:

1. **Insufficient Data**: Need at least 5-7 data points

   - **Solution**: Wait for more data collection or use demo data

2. **Low Prediction Confidence**: R² < 0.5

   - **Solution**: Check for data consistency, remove outliers

3. **Algorithm Errors**: Calculation failures

   - **Solution**: Ensemble method provides fallbacks

4. **Performance Issues**: Slow calculations
   - **Solution**: Implement caching, limit data range

### Debug Mode:

```javascript
// Enable debug logging
window.electricityCalculator.debug = true;

// Check algorithm performance
console.log(window.electricityCalculator.getPerformanceMetrics());
```

## Future Enhancements

### Planned Features:

1. **Machine Learning Models**: TensorFlow.js integration
2. **Weather Integration**: Weather-adjusted predictions
3. **Cost Analysis**: Real-time cost calculations
4. **Anomaly Detection**: Automatic outlier identification
5. **Mobile Optimization**: Touch-friendly interface
6. **Export Features**: PDF reports, Excel exports
7. **Alert System**: Automated efficiency alerts
8. **Comparative Analysis**: Multi-building comparisons

### Contributing:

To add new prediction algorithms:

1. Extend the `ElectricityCalculator` class
2. Implement the algorithm in both frontend and backend
3. Add proper error handling and confidence scoring
4. Update the UI to include the new option
5. Add comprehensive tests

---

This enhanced system provides a robust, accurate, and user-friendly electricity usage prediction platform that significantly improves upon the original quadratic regression approach.
