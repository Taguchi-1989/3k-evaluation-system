# 厳格な型定義システム (Strict Type System)

## 概要

このディレクトリには、3K評価アプリケーションの**厳格な型定義**が含まれています。
これらの型定義は、TypeScriptの高度な機能を活用して、**コンパイル時の安全性を最大化**します。

## ファイル構成

```
src/types/
├── common.ts                    # 共通型定義（Branded Types, Utility Types）
├── environmental.strict.ts      # 環境因子評価の厳格な型定義
├── mental.strict.ts             # 精神因子評価の厳格な型定義
├── evaluation.ts                # 既存の型定義（互換性維持）
└── STRICT_TYPES_README.md       # このドキュメント
```

## 主要な型安全性機能

### 1. Branded Types (ブランド型)

**問題**: 通常のTypeScriptでは、異なる意味を持つIDでも同じ`string`型として扱われ、誤った代入ができてしまいます。

```typescript
// ❌ 問題のあるコード（通常の型）
const evaluationId: string = "eval-123"
const userId: string = "user-456"

// 誤った代入が可能（型エラーにならない）
const wrongId: string = userId  // 本来はevaluationIdを使うべき
```

**解決策**: Branded Typesを使用して、コンパイル時に異なるID型を区別します。

```typescript
// ✅ 改善されたコード（Branded Types）
import { EvaluationId, UserId, createEvaluationId, createUserId } from '@/types/common'

const evaluationId: EvaluationId = createEvaluationId("eval-123")
const userId: UserId = createUserId("user-456")

// 誤った代入はコンパイルエラーになる
const wrongId: EvaluationId = userId  // ❌ Type 'UserId' is not assignable to type 'EvaluationId'
```

**利用可能なID型**:
- `EvaluationId` - 評価ID
- `PhysicalFactorId` - 肉体因子ID
- `MentalFactorId` - 精神因子ID
- `EnvironmentalFactorId` - 環境因子ID
- `HazardFactorId` - 危険因子ID
- `SubstanceId` - 有害物質ID
- `ConditionId` - 環境条件ID
- `UserId` - ユーザーID

### 2. Score Range Types (スコア範囲型)

**問題**: 通常の`number`型では、範囲外の値を防げません。

```typescript
// ❌ 問題のあるコード
const score: number = 150  // 0-100の範囲を超えているがエラーにならない
```

**解決策**: 範囲付きのBranded Typesを使用します。

```typescript
// ✅ 改善されたコード
import { Score0To100, createScore0To100 } from '@/types/common'

try {
  const score: Score0To100 = createScore0To100(150)  // ❌ ランタイムエラー
} catch (error) {
  console.error(error.message)  // "Score must be between 0 and 100, got 150"
}

const validScore: Score0To100 = createScore0To100(85)  // ✅ OK
```

**利用可能なスコア型**:
- `Score0To100` - 0-100の範囲（パーセンテージなど）
- `Score1To5` - 1-5の範囲（5段階評価）
- `Score1To10` - 1-10の範囲（10段階評価）

### 3. Date/Time Types (日付型)

**問題**: 通常の`string`型では、日付フォーマットの違いを区別できません。

```typescript
// ❌ 問題のあるコード
const date: string = "2024-08-20"  // ISO形式
const japaneseDate: string = "2024/08/20"  // 日本形式
// 両方とも同じstring型で区別できない
```

**解決策**: 日付フォーマットごとに異なる型を使用します。

```typescript
// ✅ 改善されたコード
import { ISODateString, JapaneseDateString, createISODateString, createJapaneseDateString } from '@/types/common'

const isoDate: ISODateString = createISODateString("2024-08-20")
const jpDate: JapaneseDateString = createJapaneseDateString("2024/08/20")

// 異なるフォーマットの日付を誤って代入できない
const wrongDate: ISODateString = jpDate  // ❌ Type error
```

### 4. Readonly & DeepReadonly (不変性)

**問題**: 通常のオブジェクトは変更可能で、意図しない副作用が発生しやすい。

```typescript
// ❌ 問題のあるコード
interface User {
  name: string
  age: number
}

const user: User = { name: "Taro", age: 30 }
user.age = 31  // 変更可能（意図しない副作用のリスク）
```

**解決策**: `readonly`修飾子と`DeepReadonly`型を使用します。

```typescript
// ✅ 改善されたコード
import { DeepReadonly } from '@/types/common'

interface User {
  readonly name: string
  readonly age: number
  readonly address: {
    readonly city: string
    readonly zip: string
  }
}

const user: DeepReadonly<User> = {
  name: "Taro",
  age: 30,
  address: { city: "Tokyo", zip: "100-0001" }
}

user.age = 31  // ❌ Cannot assign to 'age' because it is a read-only property
user.address.city = "Osaka"  // ❌ Cannot assign to 'city' because it is a read-only property
```

### 5. Union Types with Type Guards (型ガード付きUnion型)

**問題**: Union型の値を安全に扱うには、型ガードが必要。

```typescript
// ❌ 問題のあるコード
type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

function processRisk(level: unknown) {
  // levelがRiskLevelかどうか不明
  const risk: RiskLevel = level as RiskLevel  // Unsafe cast
}
```

**解決策**: 型ガード関数を使用して、安全に型を確認します。

```typescript
// ✅ 改善されたコード
import { RiskLevel, isRiskLevel } from '@/types/common'

function processRisk(level: unknown) {
  if (isRiskLevel(level)) {
    // この中ではlevelがRiskLevel型として扱われる
    const risk: RiskLevel = level  // ✅ Type-safe
    console.log(`Risk level: ${risk}`)
  } else {
    throw new Error(`Invalid risk level: ${level}`)
  }
}
```

## 使用例

### Environmental評価での使用例

```typescript
import {
  EnvironmentalSubstanceStrict,
  EnvironmentalConditionStrict,
  EnvironmentalDetailsStrict,
  SubstanceCategory,
  ProtectionLevel
} from '@/types/environmental.strict'
import {
  SubstanceId,
  ConditionId,
  Score1To5,
  Score0To100,
  createSubstanceId,
  createScore1To5,
  createScore0To100,
  createJapaneseDateString
} from '@/types/common'

// 有害物質データの作成
const ammonia: EnvironmentalSubstanceStrict = {
  id: createSubstanceId('sub-001'),
  substanceName: 'アンモニア',
  category: 'chemical' as SubstanceCategory,
  substanceType: 'gas',
  standardValue: 25,
  measuredValue: 15,
  measurementUnit: 'ppm',
  exposureTime: 8,
  exposureRoute: 'inhalation',
  protectionLevel: 'medium' as ProtectionLevel,
  riskLevel: createScore1To5(3),
  riskScore: createScore0To100(60),
  sdsAvailable: true,
  sdsUrl: 'https://example.com/sds/ammonia.pdf',
  measurementDate: createJapaneseDateString('2024/08/20')
}

// 環境条件データの作成
const temperature: EnvironmentalConditionStrict = {
  id: createConditionId('cond-001'),
  conditionType: 'temperature',
  label: '作業場温度',
  standardMin: 18,
  standardMax: 28,
  currentValue: 32,
  measurementUnit: '°C',
  measurementPosition: 'work_area',
  isOutOfRange: true,
  severity: 'major',
  deviationPercentage: 14.3,
  measurementDate: createJapaneseDateString('2024/08/20'),
  measuredBy: '山田太郎',
  correctiveAction: '空調設備の増強を検討'
}

// 不変性の保証
// ammonia.measuredValue = 20  // ❌ Cannot assign to 'measuredValue' because it is a read-only property

// 型安全な配列
const substances: ReadonlyArray<EnvironmentalSubstanceStrict> = [ammonia]
// substances.push(newSubstance)  // ❌ Property 'push' does not exist on type 'readonly ...'
```

### Mental評価での使用例

```typescript
import {
  MentalFactorItemStrict,
  PsychologicalStressEventStrict,
  WorkQualityAssessmentStrict,
  MentalFactorCategory,
  MentalSeverityLevel,
  StressIntensity
} from '@/types/mental.strict'
import {
  Score1To5,
  createScore1To5,
  createISODateString,
  createJapaneseDateString
} from '@/types/common'

// 精神因子項目の作成
const failureItem: MentalFactorItemStrict = {
  id: 'mfi-001',
  label: '仕事の質（失敗）',
  isChecked: true,
  category: 'failure' as MentalFactorCategory,
  hasDetail: true,
  severity: 'moderate' as MentalSeverityLevel,
  severityScore: createScore1To5(3),
  duration: {
    level: 'medium',
    percentage: 30,
    estimatedHoursPerDay: 2.4
  },
  inputValue: '組立作業でのミスが月に2-3回発生',
  relatedIncidents: ['INC-2024-001', 'INC-2024-015']
}

// 心理的ストレスイベントの作成
const stressEvent: PsychologicalStressEventStrict = {
  id: 'pse-001',
  category: 'workload_changes',
  eventDescription: '新プロジェクト立ち上げにより作業量が1.5倍に増加',
  occurredDate: createISODateString('2024-08-01'),
  intensity: 'strong' as StressIntensity,
  intensityScore: createScore1To5(4),
  duration: 'long',
  supportReceived: true,
  supportType: ['上司との面談', 'チームメンバー追加'],
  resolved: false,
  impact: {
    psychological: createScore1To5(4),
    physical: createScore1To5(3),
    work_performance: createScore1To5(3)
  }
}
```

## マイグレーションガイド

### 既存コードから厳格な型への移行

#### ステップ1: 共通型のインポート

```typescript
// Before
interface Props {
  creator?: {
    department: string
    name: string
    date: string
  }
}

// After
import { PersonInfo, DeepReadonly } from '@/types/common'

interface Props {
  readonly creator?: DeepReadonly<PersonInfo>
}
```

#### ステップ2: ID型の変換

```typescript
// Before
const evaluationId: string = "eval-123"
const substanceId: string = "sub-456"

// After
import { EvaluationId, SubstanceId, createEvaluationId, createSubstanceId } from '@/types/common'

const evaluationId: EvaluationId = createEvaluationId("eval-123")
const substanceId: SubstanceId = createSubstanceId("sub-456")
```

#### ステップ3: スコア型の変換

```typescript
// Before
const riskScore: number = 75
const severity: number = 3

// After
import { Score0To100, Score1To5, createScore0To100, createScore1To5 } from '@/types/common'

const riskScore: Score0To100 = createScore0To100(75)
const severity: Score1To5 = createScore1To5(3)
```

## ベストプラクティス

### 1. 常に型生成ヘルパーを使用する

```typescript
// ❌ Bad
const id: EvaluationId = "eval-123" as EvaluationId  // Unsafe cast

// ✅ Good
const id: EvaluationId = createEvaluationId("eval-123")  // Type-safe
```

### 2. DeepReadonlyを使用して不変性を保証する

```typescript
// ❌ Bad
interface Props {
  data: EnvironmentalDetailsStrict
}

// ✅ Good
interface Props {
  readonly data: DeepReadonly<EnvironmentalDetailsStrict>
}
```

### 3. 型ガードを使用して安全に型を確認する

```typescript
// ❌ Bad
function process(value: unknown) {
  const category = value as SubstanceCategory  // Unsafe
}

// ✅ Good
function process(value: unknown) {
  if (isSubstanceCategory(value)) {
    const category: SubstanceCategory = value  // Type-safe
  }
}
```

### 4. NonEmptyArrayを使用して空配列を防ぐ

```typescript
// ❌ Bad
interface Measures {
  emergencyProcedures: string[]  // 空配列が許容される
}

// ✅ Good
import { NonEmptyArray } from '@/types/common'

interface Measures {
  readonly emergencyProcedures: NonEmptyArray<string>  // 最低1要素が必要
}
```

## トラブルシューティング

### Q: Branded Typesの値を通常のstringに戻すには？

A: 型アサーションを使用します（ただし、通常は不要です）。

```typescript
const id: EvaluationId = createEvaluationId("eval-123")
const stringId: string = id as string  // 型アサーション
```

### Q: DeepReadonlyのオブジェクトを変更可能にするには？

A: 新しいオブジェクトを作成します。

```typescript
const readonlyData: DeepReadonly<EnvironmentalDetailsStrict> = { /* ... */ }

// 新しいオブジェクトを作成
const mutableData: EnvironmentalDetailsStrict = JSON.parse(JSON.stringify(readonlyData))
```

### Q: スコア生成時のエラーを防ぐには？

A: try-catchで範囲外の値を処理します。

```typescript
function createSafeScore(value: number): Score0To100 | null {
  try {
    return createScore0To100(value)
  } catch {
    console.error(`Invalid score: ${value}`)
    return null
  }
}
```

## さらなる改善案

- [ ] Runtime validationライブラリとの統合（zod, yupなど）
- [ ] GraphQL Code Generatorとの統合
- [ ] OpenAPI specからの型生成
- [ ] 型テストの追加（dtslintなど）

## 参考資料

- [TypeScript Handbook - Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Branded Types in TypeScript](https://egghead.io/blog/using-branded-types-in-typescript)
- [TypeScript Deep Dive - Readonly](https://basarat.gitbook.io/typescript/type-system/readonly)
