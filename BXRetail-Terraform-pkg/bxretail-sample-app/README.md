# BXRetail Sample App by PingIdentity Technical Enablement

## Introduction
BXRetail is a demo application developed by Ping Identity's Technical Enablement team to showcase various use cases implemented in a real-world looking, online retail application. The application was branded and designed to look identical to an online retail app. Because many features of online retail do not relate to Ping's line of business, many links or features are not functional. They are still include for aesthetic reality. 

It is a unique demo due to our PingOne-led initiative, with no non-SaaS software added to the environment.

BXRetail is a Single Page Application (SPA) built with React; JSX, Javascript, react-router, react-strap, SASS, JSON.

### Source Docs
We include HTML formatted documentation using the JSDoc utility. Just open the index.html file in the /jsodcs/ folder.

Also, all Ping integration methods are annotated with links to the related API docs. All of this is picked up by JSdoc, too.

## Demo Use Cases Walk-Through
*Incognito or private browser windows may lead to unexpected behavior, please use a regular browser window.*

### Guest Checkout
1. Click **Weekly Deals** on the navigation bar.
2. On this page you have two item options:
  - **BXManufacturing Clera 65" 4K UHD LED TV**
    1. Click **Add** beneath the product. This product will have an installation service auto-selected.
    2. Click **Add Services**.
    3. To finish the checkout session, click **Checkout**.
    4. Click **Checkout as guest**.
    5. Enter an email address that you have access to, click **Save**.
    6. Complete ALL account and shipping information fields.
    7. Click **Save**.
    8. Credit Card will be pre-selected as the method of payment, click **Save**.
    9. After the order completes successfully, you will see a Purchase Confirmed screen.
    10. Click **Close**
    11. You will be prompted to create an account. If you wish to remain in an anonymous guest checkout, click **Back to the Shop**.
  - **Streamstick Video Streaming Player with 4K, Full HD**
    1. Click **Add** beneath the product. This product will have a protection plan auto-selected.
    2. Click **Add Protection Plan**.
    3. To finish the checkout session, click **Checkout**.
    4. Click **Checkout as guest**.
    5. Enter an email address that you have access to, click **Save**.
    6. Complete ALL account and shipping information fields.
    7. Click **Save**.
    8. Credit Card will be pre-selected as the method of payment, click **Save**.
    9. After the order completes successfully, you will see a Purchase Confirmed screen.
    10. Click **Close**
    11. You will be prompted to create an account. If you wish to remain in an anonymous guest checkout, click **Back to the Shop**.

### Guest Checkout to Account Creation
PingOne Authentication API & PingOne Management API
1. Click **Weekly Deals** on the navigation bar.
2. On this page you have two item options:
  - **BXManufacturing Clera 65" 4K UHD LED TV**
    1. Click **Add** beneath the product. This product will have an installation service auto-selected.
    2. Click **Add Services**.
    3. To finish the checkout session, click **Checkout**.
    4. Click **Checkout as guest**.
    5. Enter an email address that you have access to, click **Save**.
    6. Complete ALL account and shipping information fields.
    7. Click **Save**.
    8. Credit Card will be pre-selected as the method of payment, click **Save**.
    9. After the order completes successfully, you will see a Purchase Confirmed screen.
    10. Click **Close**
    11. Click **Create My Account**.
    12. You will be redirected to the registration form with your email pre-populated. Enter a password and password confirmation to create your account.
    13. Click **Submit**.
    14. Enter the verififcation code you received in your email and click **Submit My Code**.
    15. Upon successful registration, you will be signed in to your account.
    16. Navigate to the **My Account** tab, then click **Manage Your Profile**. You will see the information provided during checkout populated here to be used for future purchases.
  - **Streamstick Video Streaming Player with 4K, Full HD**
    1. Click **Add** beneath the product. This product will have a protection plan auto-selected.
    2. Click **Add Protection Plan**.
    3. To finish the checkout session, click **Checkout**.
    4. Click **Checkout as guest**.
    5. Enter an email address that you have access to, click **Save**.
    6. Complete ALL account and shipping information fields.
    7. Click **Save**.
    8. Credit Card will be pre-selected as the method of payment, click **Save**.
    9. After the order completes successfully, you will see a Purchase Confirmed screen.
    10. Click **Close**
    11. Click **Create My Account**.
    12. You will be redirected to the registration form with your email pre-populated. Enter a password and password confirmation to create your account.
    13. Click **Submit**.
    14. Enter the verififcation code you received in your email and click **Submit My Code**.
    15. Upon successful registration, you will be signed in to your account.
    16. Navigate to the **My Account** tab, then click **Manage Your Profile**. You will see the information provided during checkout populated here to be used for future purchases.

### Guest Checkout to Signed-on Account
PingOne Authentication API
1. Click **Weekly Deals** on the navigation bar.
2. On this page you have two item options:
  - **BXManufacturing Clera 65" 4K UHD LED TV**
    1. Click **Add** beneath the product. This product will have an installation service auto-selected.
    2. Click **Add Services**.
    3. To finish the checkout session, click **Checkout**.
    4. Click **Sign In** 
    5. Sign on with your user credentials.
    6. After successful sign on, you are prompted to Confirm or Update Account and Shipping Details. ALL fields must be completed.
    7. Click **Save**.
    8. Credit Card will be pre-selected as the method of payment, click **Save**.
    9. After the order completes successfully, you will see a Purchase Confirmed screen.
    10. Click **Close**.
  - **Streamstick Video Streaming Player with 4K, Full HD**
    1. Click **Add** beneath the product. This product will have a protection plan auto-selected.
    2. Click **Add Protection Plan**.
    3. To finish the checkout session, click **Checkout**.
    4. Click **Sign In** 
    5. Sign on with your user credentials.
    6. After successful sign on, you are prompted to Confirm or Update Account and Shipping Details. ALL fields must be completed.
    7. Click **Save**.
    8. Credit Card will be pre-selected as the method of payment, click **Save**.
    9. After the order completes successfully, you will see a Purchase Confirmed screen.

### Registration
PingOne Authentication API & PingOne Management API
1. Click **Sign up today: Create an Account**.
2. Enter an emaill address you have access to and enter a password.
3. Enter the verification code that you received to your email and click **Submit my code**.
4. Your account has been created, and you will be signed on. 

### Sign On
PingOne Authentication API
1. Click **Sign In to My Account**.
2. Enter your user's credentials.
3. Click **Next**.
4. After successful sign on, you will land on the Weekly Deals page.

### Password Reset
PingOne Authentication API
1. Click **Sign In to My Account**.
2. On the **Sign In** modal, click **Forgot your password?**
3. Enter the email address associated with your account.
4. Click **Send Email**.
5. Enter the **Recovery Code** that was sent to the email address.
6. Enter the new password.
7. Click **Submit**. 

### Profile Management
PingOne Management API
1. After signing on to your user's account, click **My Account** from the navigation menu.
2. Click **Update** next to the Personal Details section on this page.
3. Update any profile information within this section.
4. Click **Save**.


# Disclaimer
THIS DEMO AND SAMPLE CODE IS PROVIDED "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL PING IDENTITY OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) SUSTAINED BY YOU OR A THIRD PARTY, HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT ARISING IN ANY WAY OUT OF THE USE OF THIS DEMO AND SAMPLE CODE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.