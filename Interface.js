"use strict"

function getCaretCoordinates(input) {
    const div = document.createElement('div');
    //returns an object containing the values of all CSS properties of an element
    const style = window.getComputedStyle(input); 

    //Copying all CSS styles from the original input field onto a mirrored hidden <div> element  
    //so that the text inside this hidden element looks exactly like the text in the input
    for (const property of style) { 
        div.style[property] = style[property];
    }

    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    //Sequences of white space are preserved. Lines are only 
    //broken at newline characters in the source and at <br> elements.
    div.style.whiteSpace = 'pre';
    //line break only occurs where whitespace exists
    div.style.overflowWrap = 'normal';
    div.style.height = 'auto';
    div.style.width = input.offsetWidth + 'px';
    div.style.padding = style.padding;
    div.style.border = style.border;

    const value = input.value;
    const caretPos = input.selectionStart;
    
    //create a span element to track caret with temporary marker
    const span = document.createElement('span');
    span.textContent = '|';

    //inserting the text and marker into <div> element
    div.innerText = value.substring(0, caretPos);
    div.appendChild(span);  

    //temporarily add the div element for viewport (visible area of webpage within browser) 
    //calculation purposes
    document.body.appendChild(div);
    const rect = span.getBoundingClientRect();
    const containerRect = div.getBoundingClientRect();
    document.body.removeChild(div);

    return {
        left: rect.left - containerRect.left,
        top: rect.top - containerRect.top
    };
} 

const input = document.getElementById('pokemon');
const follower = document.getElementById('follower');
let lastValue = input.value; // Track the last value to detect changes in input

// Start Pikachu at the far left of input
window.addEventListener("DOMContentLoaded", () => {
  follower.style.left = "0px";
  follower.style.top = "0px";
  // Add the transition style on page load
  follower.style.transition = "left 0.1s ease, top 0.1s ease";
});

// Catch any typing, clicks, or keyup for caret movement within input element
// Calls moveFollower to adjust the gif position after each event
input.addEventListener('input', moveFollower);
input.addEventListener('click', handleClick);
input.addEventListener('keyup', moveFollower);

// Function to move the Pikachu follower
function moveFollower() {
    const coords = getCaretCoordinates(input);
    const caretPosition = input.selectionStart;
    const inputLength = input.value.length;

    // If the caret is inside the text (not at the very end of the input)
    if (caretPosition < inputLength) {
        moveFollowerToTextEnd();
    } else {
        // If the caret is at the very end, let the follower track the caret
        if (coords) {
            const inputStyle = window.getComputedStyle(input);
            const paddingTop = parseFloat(inputStyle.paddingTop) || 0;

            const verticalAdjust = 2;   // Adjust for vertical alignment
            const horizontalAdjust = 2; // Adjust for horizontal alignment

            // Place Pikachu right of the caret, aligned to text baseline
            follower.style.left = `${coords.left + horizontalAdjust}px`;
            follower.style.top = `${coords.top + paddingTop + verticalAdjust}px`;
            follower.style.display = "block";
        }
    }
}

// Function to handle special click behavior when caret is moved behind the input length
function handleClick() {
    const currentValue = input.value;
    const caretPosition = input.selectionStart;

    // If the caret is behind the input length (inside the text)
    if (caretPosition < currentValue.length && currentValue !== lastValue) {
        moveFollowerToTextEnd();
    }

    // Update the last value to detect changes
    lastValue = currentValue;
}

// Function to move the follower to the end of the input value (not the input box)
function moveFollowerToTextEnd() {
    const inputStyle = window.getComputedStyle(input);
    const inputPadding = parseFloat(inputStyle.paddingLeft) + parseFloat(inputStyle.paddingRight);

    const inputWidth = input.offsetWidth;
    const textLength = input.value.length;
    const textWidth = getTextWidth(input.value.substring(0, textLength));

    // Adjust based on the actual text width
    const endPosition = textWidth + inputPadding;

    // Position the follower at the end of the input value's length
    follower.style.left = `${endPosition}px`;
    follower.style.display = "block";
}

// Function to calculate the width of the text content
function getTextWidth(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const font = window.getComputedStyle(input).font;
    context.font = font;
    return context.measureText(text).width;
}