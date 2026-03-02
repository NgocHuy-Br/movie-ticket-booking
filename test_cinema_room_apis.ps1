# ===============================================
# COMPREHENSIVE API TEST SCRIPT FOR CINEMA ROOM FEATURE
# ===============================================

$baseUrl = "http://localhost:8080"
$headers = @{
    "Content-Type" = "application/json"
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "CINEMA ROOM API TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Check if backend is running
Write-Host "[TEST 1] Checking if backend is running..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/test/hello" -Method GET -ErrorAction Stop
    Write-Host "✓ Backend is running" -ForegroundColor Green
    Write-Host "  Response: $health`n" -ForegroundColor Gray
}
catch {
    Write-Host "✗ Backend is NOT running - Please start the backend first!" -ForegroundColor Red
    Write-Host "  Command: cd backend; java -jar target/movieticket- 0.0.1-SNAPSHOT.jar`n" -ForegroundColor Gray
    exit 1
}

# Test 2: Get all theaters (to use for room creation)
Write-Host "[TEST 2] Getting all theaters..." -ForegroundColor Yellow
try {
    $theaters = Invoke-RestMethod -Uri "$baseUrl/api/theaters" -Method GET
    if ($theaters.data.Count -gt 0) {
        Write-Host "✓ Found $($theaters.data.Count) theaters" -ForegroundColor Green
        $testTheaterId = $theaters.data[0].id
        Write-Host "  Using Theater ID: $testTheaterId - $($theaters.data[0].name)`n" -ForegroundColor Gray
    } else {
        Write-Host "✗ No theaters found in database`n" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Failed to get theaters: $($_.Exception.Message)`n" -ForegroundColor Red
    exit 1
}

# Test 3: Get all cinema rooms
Write-Host "[TEST 3] Getting all cinema rooms..." -ForegroundColor Yellow
try {
    $allRooms = Invoke-RestMethod -Uri "$baseUrl/api/rooms" -Method GET
    Write-Host "✓ Successfully retrieved rooms" -ForegroundColor Green
    Write-Host "  Total rooms: $($allRooms.data.Count)" -ForegroundColor Gray
    if ($allRooms.data.Count -gt 0) {
        $sampleRows = $allRooms.data[0].totalRows
        $sampleCols = $allRooms.data[0].totalCols
        Write-Host "  Sample room: $($allRooms.data[0].name) - Theater: $($allRooms.data[0].theaterName) - Seats: $($allRooms.data[0].totalSeats) ($sampleRows`x$sampleCols)`n" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠ No rooms found - Migration may not have been run`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to get rooms: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  This likely means the database migration has not been run!" -ForegroundColor Yellow
    Write-Host "  Please run: mysql -u root -p movie_ticket_booking [source migration file]`n" -ForegroundColor Gray
    exit 1
}

# Test 4: Filter rooms by theater
Write-Host "[TEST 4] Filtering rooms by theater ID ($testTheaterId)..." -ForegroundColor Yellow
try {
    $theaterRooms = Invoke-RestMethod -Uri "$baseUrl/api/rooms?theaterId=$testTheaterId" -Method GET
    Write-Host "✓ Successfully filtered rooms for theater $testTheaterId" -ForegroundColor Green
    Write-Host "  Rooms in this theater: $($theaterRooms.data.Count)`n" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to filter rooms: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 5: Create a new cinema room
Write-Host "[TEST 5] Creating a new cinema room..." -ForegroundColor Yellow
$newRoom = @{
    theaterId = $testTheaterId
    name = "Phòng Test VIP"
    totalRows = 8
    totalCols = 12
} | ConvertTo-Json

try {
    $createdRoom = Invoke-RestMethod -Uri "$baseUrl/api/rooms" -Method POST -Headers $headers -Body $newRoom
    Write-Host "✓ Successfully created new room" -ForegroundColor Green
    Write-Host "  Room ID: $($createdRoom.data.id)" -ForegroundColor Gray
    Write-Host "  Name: $($createdRoom.data.name)" -ForegroundColor Gray
    $rows = $createdRoom.data.totalRows
    $cols = $createdRoom.data.totalCols
    Write-Host "  Total Seats: $($createdRoom.data.totalSeats) ($rows`x$cols)`n" -ForegroundColor Gray
    $testRoomId = $createdRoom.data.id
} catch {
    if ($_.Exception.Response.StatusCode -eq 400) {
        Write-Host "⚠ Room already exists (expected if running test multiple times)" -ForegroundColor Yellow
        # Use existing room for remaining tests
        $existingRooms = Invoke-RestMethod -Uri "$baseUrl/api/rooms?theaterId=$testTheaterId" -Method GET
        $testRoomId = $existingRooms.data[0].id
        Write-Host "  Using existing room ID: $testRoomId`n" -ForegroundColor Gray
    } else {
        Write-Host "✗ Failed to create room: $($_.Exception.Message)`n" -ForegroundColor Red
    }
}

# Test 6: Get room by ID
if ($testRoomId) {
    Write-Host "[TEST 6] Getting room by ID ($testRoomId)..." -ForegroundColor Yellow
    try {
        $room = Invoke-RestMethod -Uri "$baseUrl/api/rooms/$testRoomId" -Method GET
        Write-Host "✓ Successfully retrieved room" -ForegroundColor Green
        Write-Host "  Name: $($room.data.name)" -ForegroundColor Gray
        Write-Host "  Theater: $($room.data.theaterName)" -ForegroundColor Gray
        Write-Host "  Capacity: $($room.data.totalSeats) seats`n" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Failed to get room: $($_.Exception.Message)`n" -ForegroundColor Red
    }
}

# Test 7: Update a room
if ($testRoomId) {
    Write-Host "[TEST 7] Updating room $testRoomId..." -ForegroundColor Yellow
    $updateRoom = @{
        name = "Phòng Test IMAX"
        totalRows = 10
        totalCols = 15
    } | ConvertTo-Json

    try {
        $updatedRoom = Invoke-RestMethod -Uri "$baseUrl/api/rooms/$testRoomId" -Method PUT -Headers $headers -Body $updateRoom
        Write-Host "✓ Successfully updated room" -ForegroundColor Green
        Write-Host "  New name: $($updatedRoom.data.name)" -ForegroundColor Gray
        $rows = $updatedRoom.data.totalRows
        $cols = $updatedRoom.data.totalCols
        Write-Host "  New capacity: $($updatedRoom.data.totalSeats) seats ($rows`x$cols)`n" -ForegroundColor Gray
    } catch {
        Write-Host "✗ Failed to update room: $($_.Exception.Message)`n" -ForegroundColor Red
    }
}

# Test 8: Test showtime API with roomId
Write-Host "[TEST 8] Testing Showtime API changes..." -ForegroundColor Yellow
try {
    # Get a movie
    $movies = Invoke-RestMethod -Uri "$baseUrl/api/movies" -Method GET
    if ($movies.data.Count -gt 0) {
        $testMovieId = $movies.data[0].id
        
        # Get showtimes for this movie
        $showtimes = Invoke-RestMethod -Uri "$baseUrl/api/showtimes?movieId=$testMovieId" -Method GET
        
        if ($showtimes.data.Count -gt 0) {
            Write-Host "✓ Showtimes retrieved successfully" -ForegroundColor Green
            
            # Check if showtimes have roomId and roomName
            $sampleShowtime = $showtimes.data[0]
            if ($sampleShowtime.roomId -and $sampleShowtime.roomName) {
                Write-Host "  ✓ Showtime has roomId: $($sampleShowtime.roomId)" -ForegroundColor Green
                Write-Host "  ✓ Showtime has roomName: $($sampleShowtime.roomName)" -ForegroundColor Green
                Write-Host "  Theater: $($sampleShowtime.theaterName)" -ForegroundColor Gray
                Write-Host "  Room: $($sampleShowtime.roomName)" -ForegroundColor Gray
                Write-Host "  Total Seats: $($sampleShowtime.totalSeats)`n" -ForegroundColor Gray
            } else {
                Write-Host "  ✗ Showtime missing roomId or roomName fields!" -ForegroundColor Red
                Write-Host "  This indicates the backend code is not using the updated ShowtimeDto`n" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ⚠ No showtimes found for movie ID $testMovieId`n" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠ No movies found in database`n" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Failed to test showtime API: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 9: Check seat initialization for showtime
Write-Host "[TEST 9] Checking seat initialization..." -ForegroundColor Yellow
try {
    $showtimes = Invoke-RestMethod -Uri "$baseUrl/api/showtimes" -Method GET
    if ($showtimes.data.Count -gt 0) {
        $testShowtime = $showtimes.data[0]
        $seats = Invoke-RestMethod -Uri "$baseUrl/api/showtimes/$($testShowtime.id)/seats" -Method GET
        
        if ($seats.Count -gt 0) {
            Write-Host "✓ Seats are initialized for showtime" -ForegroundColor Green
            Write-Host "  Showtime ID: $($testShowtime.id)" -ForegroundColor Gray
            Write-Host "  Room: $($testShowtime.roomName)" -ForegroundColor Gray
            Write-Host "  Total Seats: $($seats.Count)" -ForegroundColor Gray
            Write-Host "  Expected Seats: $($testShowtime.totalSeats)" -ForegroundColor Gray
            
            if ($seats.Count -eq $testShowtime.totalSeats) {
                Write-Host "  ✓ Seat count matches room configuration`n" -ForegroundColor Green
            } else {
                Write-Host "  ✗ Seat count mismatch! ($($seats.Count) vs $($testShowtime.totalSeats))`n" -ForegroundColor Red
            }
        } else {
            Write-Host "✗ No seats found for showtime!" -ForegroundColor Red
            Write-Host "  Seats need to be initialized" -ForegroundColor Yellow
            Write-Host "  Run the init_seats_for_existing_showtimes.sql script`n" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "✗ Failed to check seats: $($_.Exception.Message)`n" -ForegroundColor Red
}

# Test 10: Clean up test room (optional)
Write-Host "[TEST 10] Cleaning up test room..." -ForegroundColor Yellow
$cleanup = Read-Host "Do you want to delete the test room? (y/N)"
if ($cleanup -eq 'y' -or $cleanup -eq 'Y') {
    if ($testRoomId) {
        try {
            Invoke-RestMethod -Uri "$baseUrl/api/rooms/$testRoomId" -Method DELETE
            Write-Host "✓ Test room deleted successfully`n" -ForegroundColor Green
        } catch {
            Write-Host "✗ Failed to delete test room: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "  (This may fail if showtimes are using this room)`n" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "Skipping cleanup`n" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "TEST SUITE COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
