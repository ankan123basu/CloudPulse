package com.cloudpulse;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    // Test 1: GET /students returns HTTP 200 OK
    @Test
    public void getAllStudents_shouldReturn200() throws Exception {
        mockMvc.perform(get("/students"))
               .andExpect(status().isOk());
    }

    // Test 2: GET /students returns a JSON array
    @Test
    public void getAllStudents_shouldReturnList() throws Exception {
        mockMvc.perform(get("/students"))
               .andExpect(jsonPath("$").isArray());
    }

    // Test 3: /actuator/health endpoint is alive
    @Test
    public void healthEndpoint_shouldBeUp() throws Exception {
        mockMvc.perform(get("/actuator/health"))
               .andExpect(status().isOk());
    }
}
