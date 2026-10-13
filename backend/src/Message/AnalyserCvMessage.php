<?php

namespace App\Message;

final class AnalyserCvMessage
{
    public function __construct(
        public readonly int $analyseId,
    ) {}
}
