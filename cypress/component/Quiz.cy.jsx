import React from 'react';
import Quiz from '../../client/src/components/Quiz'; // adjust this path if needed
import { mount } from 'cypress/react';

describe('Quiz Component', () => {
    it('renders the site correctly', () => {
        mount(<Quiz />);
        
        // Check if the start button is visible
        cy.contains('Start Quiz').should('be.visible');
        
        // Check if the initial quiz state does not show any questions yet
        cy.get('[data-cy="question"]').should('not.exist');
      });

    it('starts the quiz when the "Start Quiz" button is clicked', () => {
        const questions = [
          {
            question: 'What is your favorite color?',
            answers: [
              { text: 'Red', isCorrect: true },
              { text: 'Blue', isCorrect: false },
            ],
          },
        ];
      
        // Mock the API response to return the question
        cy.intercept('GET', '/api/questions/random', {
          statusCode: 200,
          body: questions,
        }).as('getQuestion');
      
        mount(<Quiz />);
      
        // Ensure the "Start Quiz" button is visible
        cy.contains('Start Quiz').should('be.visible');
      
        // Click the "Start Quiz" button
        cy.contains('Start Quiz').click();
      
        // Wait for the question to load
        cy.wait('@getQuestion');
      
        // Verify that the first question is displayed
        cy.get('[data-cy="question"]').should('contain', 'What is your favorite color?');
      });
  
    it('answers a question correctly and moves to the next', () => {
        cy.intercept('GET', '/api/questions/random', {
          statusCode: 200,
          body: [
            {
              question: 'What is your favorite color?',
              answers: [
                { text: 'Red', isCorrect: false },
                { text: 'Blue', isCorrect: true },
                { text: 'Green', isCorrect: false },
                { text: 'Yellow', isCorrect: false },
              ],
            },
            {
              question: 'What is your favorite animal?',
              answers: [
                { text: 'Cat', isCorrect: false },
                { text: 'Dog', isCorrect: true },
                { text: 'Bird', isCorrect: false },
                { text: 'Fish', isCorrect: false },
              ],
            },
          ],
        }).as('getQuestion');
      
        mount(<Quiz />);
      
        cy.contains('Start Quiz').click();
        cy.wait('@getQuestion');
      
        // Check the first question appears
        cy.get('[data-cy="question"]').should('contain', 'What is your favorite color?');
      
        // Click the button for the correct answer ("Blue" button)
        cy.get('[data-cy="answer-1"]').click(); 
      
        // Expect the next question to appear
        cy.get('[data-cy="question"]').should('contain', 'What is your favorite animal?');
      });
  
    it('answers all 10 questions and completes the quiz', () => {
        const questions = Array.from({ length: 10 }, (_, index) => ({
          question: `Question ${index + 1}`,
          answers: [
            { text: 'Answer A', isCorrect: false },
            { text: 'Answer B', isCorrect: false },
            { text: 'Answer C', isCorrect: false },
            { text: 'Answer D', isCorrect: true }, 
          ],
        }));
      
        cy.intercept('GET', '/api/questions/random', {
          statusCode: 200,
          body: questions,
        }).as('getQuestion');
      
        mount(<Quiz />);
      
        cy.contains('Start Quiz').click();
      
        // Loop through all the questions and answer them
        for (let i = 0; i < 10; i++) {
          cy.get('[data-cy="question"]').should('contain', `Question ${i + 1}`); 
      
          // Click the correct answer (D in this case)
          cy.get(`[data-cy="answer-3"]`).click(); 
        }
      
        // After answering 10 questions, expect the quiz to complete
        cy.contains('Quiz Complete').should('be.visible'); 
        cy.contains('Your score: 10/10').should('be.visible'); 
        cy.contains('Take New Quiz').should('be.visible'); 
    });

    it('starts a new quiz after completing the first one', () => {
        const questions = Array.from({ length: 10 }, (_, index) => ({
          question: `Question ${index + 1}`,
          answers: [
            { text: 'Answer A', isCorrect: false },
            { text: 'Answer B', isCorrect: false },
            { text: 'Answer C', isCorrect: false },
            { text: 'Answer D', isCorrect: true },
          ],
        }));
      
        cy.intercept('GET', '/api/questions/random', {
          statusCode: 200,
          body: questions,
        }).as('getQuestion');
      
        mount(<Quiz />);
      
        cy.contains('Start Quiz').click();
      
        // Loop through all the questions and answer them
        for (let i = 0; i < 10; i++) {
          cy.contains(`Question ${i + 1}`).should('be.visible');
          
          // Click the correct answer (D in this case)
          cy.get(`[data-cy="answer-3"]`).click(); 
        }
      
        // After answering 10 questions, expect the quiz to complete
        cy.contains('Quiz Complete').should('be.visible'); 
        cy.contains('Your score: 10/10').should('be.visible'); 
        cy.contains('Take New Quiz').should('be.visible'); 
      
        // Start a new quiz
        cy.contains('Take New Quiz').click();
      
        // Ensure the first question of the new quiz is visible again
        cy.contains('Question 1').should('be.visible');
      })
  });