# Simple API Test Script for Cinema Room Feature
$baseUrl = "http://localhost:8080"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CINEMA ROOM API TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Backend health check
Write-Host "[TEST 1] Checking backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/test/hello" -Method GET -ErrorAction Stop
    Write-Host "✓ Backend is running`n" -ForegroundColor Green
}
catch {
    Write-Host "✗ Backend NOT running`n" -ForegroundColor Red
    exit 1
}

# Test 2: Get all theaters
Write-Host "[TEST 2] Getting theaters..." -ForegroundColor Yellow
try {
    $theaters = Invoke-RestMethod -Uri "$baseUrl/api/theaters" -Method GET
    Write-Host "✓ Found $($theaters.data.Count) theaters" -ForegroundColor Green
    if ($theaters.data.Count -gt 0) {
        $testTheaterId = $theaters.data[0].id
        Write-Host "  Test Theater: $($theaters.data[0].name) (ID: $testTheaterId)`n" -ForegroundColor Gray
    }
}
catch {
    Write-Host "✗ Failed`n" -ForegroundColor Red
}

# Test 3: Get all cinema rooms
Write-Host "[TEST 3] Getting all cinema rooms..." -ForegroundColor Yellow
try {
    $allRooms = Invoke-RestMethod -Uri "$baseUrl/api/rooms" -Method GET
    Write-Host "✓ Successfully retrieved rooms" -ForegroundColor Green
    Write-Host "  Total rooms: $($allRooms.data.Count)" -ForegroundColor Gray
    
    if ($allRooms.data.Count -gt 0) {
        $room = $allRooms.data[0]
        Write-Host "  Sample: $($room.name) at $($room.theaterName)" -ForegroundColor Gray
        Write-Host "  Layout: $($room.totalRows) rows x $($room.totalCols) cols = $($room.totalSeats) seats`n" -ForegroundColor Gray
        $testRoomId = $room.id
    }
    else {
        Write-Host "  WARNING: No rooms found!`n" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Database migration may not have been run!`n" -ForegroundColor Yellow
    exit 1
}

# Test 4: Filter rooms by theater
Write-Host "[TEST 4] Filter rooms by theater..." -ForegroundColor Yellow
if ($testTheaterId) {
    try {
        $theaterRooms = Invoke-RestMethod -Uri "$baseUrl/api/rooms?theaterId=$testTheaterId" -Method GET
        Write-Host "✓ Found $($theaterRooms.data.Count) rooms for theater`n" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Failed`n" -ForegroundColor Red
    }
}

# Test 5: Create new room
Write-Host "[TEST 5] Creating new cinema room..." -ForegroundColor Yellow
if ($testTheaterId) {
    $newRoom = @{
        theaterId = $testTheaterId
        name = "Test Room VIP"
        totalRows = 8
        totalCols = 12
    } | ConvertTo-Json

    try {
        $created = Invoke-RestMethod -Uri "$baseUrl/api/rooms" -Method POST -Headers @{"Content-Type"="application/json"} -Body $newRoom
        Write-Host "✓ Created room: $($created.data.name)" -ForegroundColor Green
        Write-Host "  ID: $($created.data.id)" -ForegroundColor Gray
        Write-Host "  Capacity: $($created.data.totalSeats) seats`n" -ForegroundColor Gray
        $testRoomId = $created.data.id
    }
    catch {
        Write-Host "⚠ Room may already exist`n" -ForegroundColor Yellow
    }
}

# Test 6: Get room by ID
Write-Host "[TEST 6] Get room by ID..." -ForegroundColor Yellow
if ($testRoomId) {
    try {
        $room = Invoke-RestMethod -Uri "$baseUrl/api/rooms/$testRoomId" -Method GET
        Write-Host "✓ Retrieved: $($room.data.name)" -ForegroundColor Green
        Write-Host "  Theater: $($room.data.theaterName)" -ForegroundColor Gray
        Write-Host "  Capacity: $($room.data.totalSeats) seats`n" -ForegroundColor Gray
    }
    catch {
        Write-Host "✗ Failed`n" -ForegroundColor Red
    }
}

# Test 7: Update room
Write-Host "[TEST 7] Update room..." -ForegroundColor Yellow
if ($testRoomId) {
    $updateRoom = @{
        name = "Test Room IMAX"
        totalRows = 10
        totalCols = 15
    } | ConvertTo-Json

    try {
        $updated = Invoke-RestMethod -Uri "$baseUrl/api/rooms/$testRoomId" -Method PUT -Headers @{"Content-Type"="application/json"} -Body $updateRoom
        Write-Host "✓ Updated: $($updated.data.name)" -ForegroundColor Green
        Write-Host "  New capacity: $($updated.data.totalSeats) seats`n" -ForegroundColor Gray
    }
    catch {
        Write-Host "✗ Failed`n" -ForegroundColor Red
    }
}

# Test 8: Check showtime API
Write-Host "[TEST 8] Checking showtime API..." -ForegroundColor Yellow
try {
    $movies = Invoke-RestMethod -Uri "$baseUrl/api/movies" -Method GET
    if ($movies.data.Count -gt 0) {
        $movieId = $movies.data[0].id
        $showtimes = Invoke-RestMethod -Uri "$baseUrl/api/showtimes?movieId=$movieId" -Method GET
        
        if ($showtimes.data.Count -gt 0) {
            $st = $showtimes.data[0]
            
            if ($st.roomId -and $st.roomName) {
                Write-Host "✓ Showtime has room info" -ForegroundColor Green
                Write-Host "  Movie: $($movies.data[0].title)" -ForegroundColor Gray
                Write-Host "  Theater: $($st.theaterName)" -ForegroundColor Gray
                Write-Host "  Room: $($st.roomName) (ID: $($st.roomId))" -ForegroundColor Gray
                Write-Host "  Total Seats: $($st.totalSeats)`n" -ForegroundColor Gray
            }
            else {
                Write-Host "✗ Showtime missing roomId or roomName!`n" -ForegroundColor Red
            }
        }
        else {
            Write-Host "⚠ No showtimes found`n" -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "✗ Failed`n" -ForegroundColor Red
}

# Test 9: Check seats
Write-Host "[TEST 9] Checking seat initialization..." -ForegroundColor Yellow
try {
    $showtimes = Invoke-RestMethod -Uri "$baseUrl/api/showtimes" -Method GET
    if ($showtimes.data.Count -gt 0) {
        $st = $showtimes.data[0]
        $seats = Invoke-RestMethod -Uri "$baseUrl/api/showtimes/$($st.id)/seats" -Method GET
        
        if ($seats.Count -gt 0) {
            Write-Host "✓ Seats initialized" -ForegroundColor Green
            Write-Host "  Showtime ID: $($st.id)" -ForegroundColor Gray
            Write-Host "  Actual seats: $($seats.Count)" -ForegroundColor Gray
            Write-Host "  Expected: $($st.totalSeats)" -ForegroundColor Gray
            
            if ($seats.Count -eq $st.totalSeats) {
                Write-Host "  ✓ Seat count matches room config`n" -ForegroundColor Green
            }
            else {
                Write-Host "  ⚠ Seat count mismatch!`n" -ForegroundColor Yellow
            }
        }
        else {
            Write-Host "✗ No seats found - need initialization`n" -ForegroundColor Red
        }
    }
}
catch {
    Write-Host "✗ Failed`n" -ForegroundColor Red
}

# Test 10: Cleanup
Write-Host "[TEST 10] Cleanup..." -ForegroundColor Yellow
Write-Host "Skipping - keeping test data for reference`n" -ForegroundColor Gray

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTS COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
