import google.generativeai as genai
genai.configure(api_key="AIzaSyCB5UeJqhOGNMHFOss0t8aGfAEx8JAjdX0")
model = genai.GenerativeModel('gemini-2.5-flash')
response = model.generate_content("Hello")
print(response.text)