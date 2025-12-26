import json
from playwright.sync_api import sync_playwright
import time

# --- HARDCODED CONFIGURATION ---
USERNAME = "9020642260028"
PASSWORD = "Z7i@62934"
BASE_URL = "https://test.z7i.in"
HEADLESS = False 
filename = "dummy.json"

def login(context, browser):
  page = context.new_page()

  print(f"Navigating to {BASE_URL}...")
  page.goto(BASE_URL, wait_until="domcontentloaded")

  # --- LOGIN LOGIC ---
  # Check if already logged in (redirected to student dashboard)
  if "/student/" not in page.url:
    print("Logging in...")
    
    # handle the login trigger button
    login_trigger = page.locator("a.login").first
    login_trigger.wait_for(state="attached")
    
    if login_trigger.is_visible():
      login_trigger.click(force=True)
    else:
      login_trigger.evaluate("node => node.click()")

    # Wait for modal
    login_modal = page.locator("#login-modal")
    login_modal.wait_for(state="visible")

    # Fill credentials
    login_modal.get_by_placeholder("Username or Email ID").fill(USERNAME)
    page.locator("#login_password").fill(PASSWORD)
    page.locator("#login-modal button.log-in").click()

    # Handle Login result
    try:
      # Wait for redirect to student dashboard
      page.wait_for_url(r"**/student/**", timeout=10000)
    except:
      print("Login failed.")
      time.sleep(5000)
      browser.close()
      exit()
    
def get_nth_testdetails(n, context):
  data_url = f"{BASE_URL}/student/tests/get-mypackage-details/69392bf39096d1cdfe0d60ad"
  print(f"Getting test details from {data_url}")
  
  response = context.request.get(data_url)
  test_details = None
  
  if response.ok:
    try:
      data = response.json()
      test_details = data['data']['test_series'][0]['all_tests'][n]
      test_details = {'test_name': test_details['test_name'], 'test_id': test_details['_id']['$oid']}
    except Exception:
      print("Error fetching test details")
  else:
    print(f"Failed to fetch test details. Status: {response.status}")
    
  return test_details
  
def fetch_qs(test_details, context):
  global filename
  data_url = f"{BASE_URL}/student/reports/questionwise/{test_details['test_id']}"
  print(f"Fetching data from {data_url}...")
  
  response = context.request.get(data_url)
  filename = input(f'json file name for {test_details['test_name']}: ')
  output_file = '../public/'+filename
  
  if response.ok:
    try:
      # Try to parse JSON
      data = response.json()
      with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
      print(f"Success! Data saved to {output_file}")
    except Exception:
      # Fallback to text if not JSON
      text = response.text()
      with open("output_dump.txt", "w", encoding="utf-8") as f:
          f.write(text)
      print("Response was not JSON. Saved to output_dump.txt")
  else:
    print(f"Failed to fetch data. Status: {response.status}")

def update_data():
  with open('../src/test_data.json', 'r') as file:
    content = json.load(file)
  content = [filename] + content
  
  with open('../src/test_data.json', 'w') as file:
    print(content)
    if input('Proceed ? (y/n): ').lower() == 'y':
      json.dump(content, file)
  
if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=HEADLESS)
    # Create a context to store cookies/session state
    context = browser.new_context()
    login(context, browser)
    test_details = get_nth_testdetails(int(input("nth test (negative for reverse order): ")), context)
    fetch_qs(test_details, context)
    browser.close()
    update_data()