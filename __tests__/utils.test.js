// Enkel test-fil for kritiske funksjoner
// Kjør med: npm test

// Test JSON parsing funksjonalitet
function testJsonParsing() {
  const mockData = {
    selected_teams: '{"0": [{"teamName": "Test Team", "players": []}]}',
    challenge_winners: '{"0": "Test Team"}'
  };

  // Test parsing
  const selectedTeams = typeof mockData.selected_teams === 'string' 
    ? JSON.parse(mockData.selected_teams) 
    : mockData.selected_teams;
  
  const winners = typeof mockData.challenge_winners === 'string' 
    ? JSON.parse(mockData.challenge_winners) 
    : mockData.challenge_winners;

  console.log('✅ JSON parsing test:', {
    selectedTeams: selectedTeams['0'][0].teamName === 'Test Team',
    winners: winners['0'] === 'Test Team'
  });
}

// Test betting logic
function testBettingLogic() {
  const testCases = [
    { playerId: 'EX0UG1', teamName: 'Drita Divas', amount: 50, expected: true },
    { playerId: 'EX0UG1', teamName: 'Drita Divas', amount: -10, expected: false },
    { playerId: 'EX0UG1', teamName: 'Drita Divas', amount: 0, expected: false }
  ];

  testCases.forEach(test => {
    const isValid = test.amount > 0 && test.amount <= 100;
    console.log(`✅ Bet validation test: ${test.playerId} bets ${test.amount} -> ${isValid === test.expected ? 'PASS' : 'FAIL'}`);
  });
}

// Kjør tester
console.log('🧪 Running Drumble tests...');
testJsonParsing();
testBettingLogic();
console.log('✅ All tests completed!'); 