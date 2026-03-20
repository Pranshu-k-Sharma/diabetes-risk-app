# About the Model

## What It Does
It's a RandomForest that takes 8 health numbers (glucose, BMI, age, etc.) and predicts whether someone has diabetes. Wrapped in a scikit-learn pipeline with standardization so the numbers are on the same scale.

## What It's NOT
- Not a real diagnostic tool. Don't use this to make medical decisions.
- Not FDA approved or anything. Just a prototype I built.
- Dataset is tiny so the numbers are probably wrong.

## The Inputs
- Pregnancies
- Glucose  
- BloodPressure
- SkinThickness
- Insulin
- BMI
- DiabetesPedigreeFunction
- Age

## What It Returns
- Yes/No prediction (Diabetes or No Diabetes)
- Confidence score (the probability)
- Risk level: Low, Moderate, High, or Very High

## How I Built It
- Data: `backend/dataset.csv`
- Split: 80% train, 20% test with stratification so classes are balanced
- Metrics saved to `backend/model_metrics.json`: accuracy, precision, recall, F1, AUC, confusion matrix

## Big Caveats
- Dataset is super small so nothing's reliable. High accuracy numbers don't mean anything.
- I didn't check if it works the same for different groups (age, gender, etc.)
- No way to know if it'd actually work on new data I didn't train on

## How I Tried to Be Responsible
- Every prediction shows a disclaimer: "talk to a doctor, not the AI"
- Returns confidence scores, not just yes/no
- Validates input so garbage in = garbage out becomes obvious
- I'm transparent about it being a prototype

## What I'd Do If I Kept Going
- Get real data from somewhere
- Test it on different groups
- Actually measure performance on hold-out data
- Version the model so I can tell if changes help or hurt
