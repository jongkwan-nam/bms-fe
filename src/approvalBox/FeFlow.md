# 결재선 규칙

## 부서
  
  어디에 있던, 순차협조 or 병렬협조 고정

## 사용자

| nth      | user_approval | user_jeonkyul | user_daekyul | user_agree_s | user_agree_p | user_nosign | user_refer | user_noapproval |
| -------- | ------------- | ------------- | ------------ | ------------ | ------------ | ----------- | ---------- | --------------- |
| last     | 결재          | 전결          |              | 협조         | 병렬협조     | 확인        | 참조       | 공석(결재안함)  |
| last - 1 | 검토          | 전결          | 대결         | 협조         | 병렬협조     | 확인        | 참조       | 공석(결재안함)  |
| middle   | 검토          | 전결          |              | 협조         | 병렬협조     | 확인        | 참조       | 공석(결재안함)  |
| first    | 기안          | 전결          |              |              |              | 확인        |            |                 |

### 기안, 검토, 결재

* 동일 타입, 결재선의 순번에 따라 표시명만 바뀜

### 전결

* 어느 순번이든 선택 가능
* 전결 뒤 순번은, 결재안함(default), 협조, 병렬협조, 참조만 선택 가능

### 결재 -> 전결

* 뒤 순번은 결재안함으로 선택

### 전결 -> 결재

* 뒤 순번은 결재로 선택

### 대결

* last, last - 1 이 이웃한 사용자일때, last - 1만 선택 가능
* 선택시 last의 타입은 후열, 후결, 후열안함

### 공석

* 전결 뒤는 '결재안함'으로 표시
* 공석이면 공석사유 선택 필요
