import { test, expect } from '@playwright/test'

test.describe('Lovees App Smoke Test', () => {
  test('complete user journey: registration → onboarding → swipe → chat', async ({ browser }) => {
    // Create two browser contexts for two users
    const user1Context = await browser.newContext()
    const user2Context = await browser.newContext()
    
    const user1Page = await user1Context.newPage()
    const user2Page = await user2Context.newPage()

    // Test data
    const user1Data = {
      email: 'user1@test.com',
      password: 'password123',
      name: 'Alice Smith',
      birthdate: '1995-01-01',
      gender: 'FEMALE',
      city: 'Moscow',
      bio: 'Love traveling and music',
      interests: ['music', 'travel', 'photography']
    }

    const user2Data = {
      email: 'user2@test.com',
      password: 'password123',
      name: 'Bob Johnson',
      birthdate: '1992-05-15',
      gender: 'MALE',
      city: 'Moscow',
      bio: 'Sports enthusiast and food lover',
      interests: ['sports', 'cooking', 'music']
    }

    // User 1 Registration and Onboarding
    await test.step('User 1: Registration', async () => {
      await user1Page.goto('/register')
      await user1Page.fill('input[name="email"]', user1Data.email)
      await user1Page.fill('input[name="password"]', user1Data.password)
      await user1Page.fill('input[name="confirmPassword"]', user1Data.password)
      await user1Page.click('button[type="submit"]')
      
      // Should redirect to onboarding
      await expect(user1Page).toHaveURL('/onboarding')
    })

    await test.step('User 1: Onboarding', async () => {
      await user1Page.fill('input[name="name"]', user1Data.name)
      await user1Page.fill('input[name="birthdate"]', user1Data.birthdate)
      await user1Page.selectOption('select[name="gender"]', user1Data.gender)
      await user1Page.fill('textarea[name="bio"]', user1Data.bio)
      await user1Page.fill('input[name="city"]', user1Data.city)
      
      // Set location (mock coordinates for Moscow)
      await user1Page.fill('input[name="lat"]', '55.7558')
      await user1Page.fill('input[name="lng"]', '37.6176')
      
      // Add interests
      for (const interest of user1Data.interests) {
        await user1Page.fill('input[placeholder*="интерес"]', interest)
        await user1Page.press('input[placeholder*="интерес"]', 'Enter')
      }
      
      // Upload a photo (mock)
      await user1Page.setInputFiles('input[type="file"]', {
        name: 'photo.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      })
      
      await user1Page.click('button[type="submit"]')
      
      // Should redirect to home
      await expect(user1Page).toHaveURL('/')
    })

    // User 2 Registration and Onboarding
    await test.step('User 2: Registration', async () => {
      await user2Page.goto('/register')
      await user2Page.fill('input[name="email"]', user2Data.email)
      await user2Page.fill('input[name="password"]', user2Data.password)
      await user2Page.fill('input[name="confirmPassword"]', user2Data.password)
      await user2Page.click('button[type="submit"]')
      
      // Should redirect to onboarding
      await expect(user2Page).toHaveURL('/onboarding')
    })

    await test.step('User 2: Onboarding', async () => {
      await user2Page.fill('input[name="name"]', user2Data.name)
      await user2Page.fill('input[name="birthdate"]', user2Data.birthdate)
      await user2Page.selectOption('select[name="gender"]', user2Data.gender)
      await user2Page.fill('textarea[name="bio"]', user2Data.bio)
      await user2Page.fill('input[name="city"]', user2Data.city)
      
      // Set location (mock coordinates for Moscow)
      await user2Page.fill('input[name="lat"]', '55.7558')
      await user2Page.fill('input[name="lng"]', '37.6176')
      
      // Add interests
      for (const interest of user2Data.interests) {
        await user2Page.fill('input[placeholder*="интерес"]', interest)
        await user2Page.press('input[placeholder*="интерес"]', 'Enter')
      }
      
      // Upload a photo (mock)
      await user2Page.setInputFiles('input[type="file"]', {
        name: 'photo.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake-image-data')
      })
      
      await user2Page.click('button[type="submit"]')
      
      // Should redirect to home
      await expect(user2Page).toHaveURL('/')
    })

    // User 1 swipes right on User 2
    await test.step('User 1: Swipe right on User 2', async () => {
      await user1Page.goto('/browse')
      
      // Wait for candidate to load
      await user1Page.waitForSelector('[data-testid="candidate-card"]', { timeout: 10000 })
      
      // Check if User 2 is shown (by name)
      const candidateName = await user1Page.textContent('[data-testid="candidate-name"]')
      if (candidateName === user2Data.name) {
        await user1Page.click('[data-testid="swipe-right"]')
        
        // Should show "It's a match!" modal if User 2 also swiped right
        // For now, just verify the swipe was recorded
        await expect(user1Page.locator('[data-testid="swipe-success"]')).toBeVisible()
      }
    })

    // User 2 swipes right on User 1
    await test.step('User 2: Swipe right on User 1', async () => {
      await user2Page.goto('/browse')
      
      // Wait for candidate to load
      await user2Page.waitForSelector('[data-testid="candidate-card"]', { timeout: 10000 })
      
      // Check if User 1 is shown (by name)
      const candidateName = await user2Page.textContent('[data-testid="candidate-name"]')
      if (candidateName === user1Data.name) {
        await user2Page.click('[data-testid="swipe-right"]')
        
        // Should show "It's a match!" modal
        await expect(user2Page.locator('[data-testid="match-modal"]')).toBeVisible()
        await expect(user2Page.locator('text=It\'s a match!')).toBeVisible()
        
        // Click "Chat" button
        await user2Page.click('[data-testid="chat-button"]')
      }
    })

    // Chat functionality
    await test.step('Chat: Send messages between users', async () => {
      // User 2 should be in chat page
      await expect(user2Page).toHaveURL(/\/chat\/.*/)
      
      // Send a message from User 2
      await user2Page.fill('[data-testid="message-input"]', 'Hello! Nice to meet you!')
      await user2Page.click('[data-testid="send-button"]')
      
      // Verify message appears
      await expect(user2Page.locator('[data-testid="message"]').first()).toContainText('Hello! Nice to meet you!')
      
      // User 1 goes to matches and opens chat
      await user1Page.goto('/matches')
      await user1Page.waitForSelector('[data-testid="match-card"]')
      await user1Page.click('[data-testid="match-card"]')
      
      // Should be in chat page
      await expect(user1Page).toHaveURL(/\/chat\/.*/)
      
      // Send a reply from User 1
      await user1Page.fill('[data-testid="message-input"]', 'Hi there! Great to match with you!')
      await user1Page.click('[data-testid="send-button"]')
      
      // Verify both messages are visible
      await expect(user1Page.locator('[data-testid="message"]').first()).toContainText('Hello! Nice to meet you!')
      await expect(user1Page.locator('[data-testid="message"]').last()).toContainText('Hi there! Great to match with you!')
    })

    // Cleanup
    await user1Context.close()
    await user2Context.close()
  })

  test('home page loads correctly', async ({ page }) => {
    await page.goto('/')
    
    // Should show welcome message for unauthenticated users
    await expect(page.locator('h2')).toContainText('Welcome to Lovees App')
    
    // Should have login and register buttons
    await expect(page.locator('a[href="/login"]')).toBeVisible()
    await expect(page.locator('a[href="/register"]')).toBeVisible()
  })

  test('login page works', async ({ page }) => {
    await page.goto('/login')
    
    // Should have login form
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // Should have Google login button
    await expect(page.locator('text=Google')).toBeVisible()
  })

  test('register page works', async ({ page }) => {
    await page.goto('/register')
    
    // Should have registration form
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('privacy and terms pages load', async ({ page }) => {
    await page.goto('/privacy')
    await expect(page.locator('h1')).toContainText('Политика конфиденциальности')
    
    await page.goto('/terms')
    await expect(page.locator('h1')).toContainText('Условия использования')
  })
})
